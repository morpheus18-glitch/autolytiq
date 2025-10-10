/**
 * Jurisdiction Service
 * 
 * Handles ZIP code resolution and retrieval of applicable tax rules and fees.
 */

import { eq, and, lte, or, isNull, sql } from 'drizzle-orm';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import {
  jurisdictions,
  taxRules,
  feeCatalog,
  type Jurisdiction,
  type TaxRule,
  type FeeCatalogItem,
} from '@shared/schema';

export class JurisdictionService {
  /**
   * Resolve ZIP code to jurisdiction
   * @param zip - 5 or 10 digit ZIP code
   * @param db - Database client
   * @returns Jurisdiction or null if not found
   */
  static async resolveByZip(
    zip: string,
    db: NeonHttpDatabase
  ): Promise<Jurisdiction | null> {
    // Normalize ZIP (take first 5 digits)
    const normalizedZip = zip.replace(/[^0-9]/g, '').slice(0, 5);
    
    if (!normalizedZip || normalizedZip.length !== 5) {
      return null;
    }

    // Look up jurisdiction by ZIP
    const results = await db
      .select()
      .from(jurisdictions)
      .where(eq(jurisdictions.zip, normalizedZip))
      .limit(1);

    return results[0] || null;
  }

  /**
   * Get all tax rules for a jurisdiction
   * @param jurisdictionId - Jurisdiction ID
   * @param dealType - 'purchase' or 'lease'
   * @param effectiveDate - Date to check effective rules (defaults to now)
   * @param db - Database client
   * @returns Array of applicable tax rules, ordered by precedence
   */
  static async getTaxRules(
    jurisdictionId: number,
    dealType: 'purchase' | 'lease',
    effectiveDate: Date = new Date(),
    db: NeonHttpDatabase
  ): Promise<TaxRule[]> {
    const rules = await db
      .select()
      .from(taxRules)
      .where(
        and(
          eq(taxRules.jurisdictionId, jurisdictionId),
          // Rule applies to this deal type
          or(
            eq(taxRules.appliesTo, dealType),
            eq(taxRules.appliesTo, 'both')
          ),
          // Rule is effective
          lte(taxRules.effectiveFrom, effectiveDate),
          or(
            isNull(taxRules.effectiveTo),
            sql`${taxRules.effectiveTo} >= ${effectiveDate}`
          )
        )
      )
      .orderBy(taxRules.precedence);

    return rules;
  }

  /**
   * Get all fees for a jurisdiction
   * @param jurisdictionId - Jurisdiction ID
   * @param dealType - 'purchase' or 'lease'
   * @param effectiveDate - Date to check effective fees (defaults to now)
   * @param db - Database client
   * @returns Array of applicable fees
   */
  static async getFees(
    jurisdictionId: number,
    dealType: 'purchase' | 'lease',
    effectiveDate: Date = new Date(),
    db: NeonHttpDatabase
  ): Promise<FeeCatalogItem[]> {
    const fees = await db
      .select()
      .from(feeCatalog)
      .where(
        and(
          eq(feeCatalog.jurisdictionId, jurisdictionId),
          // Fee applies to this deal type
          or(
            eq(feeCatalog.appliesTo, dealType),
            eq(feeCatalog.appliesTo, 'both')
          ),
          // Fee is effective
          lte(feeCatalog.effectiveFrom, effectiveDate),
          or(
            isNull(feeCatalog.effectiveTo),
            sql`${feeCatalog.effectiveTo} >= ${effectiveDate}`
          )
        )
      );

    return fees;
  }

  /**
   * Get jurisdiction details with applicable tax rules and fees
   * @param zip - ZIP code
   * @param dealType - 'purchase' or 'lease'
   * @param db - Database client
   * @returns Combined jurisdiction, tax rules, and fees
   */
  static async getJurisdictionDetails(
    zip: string,
    dealType: 'purchase' | 'lease',
    db: NeonHttpDatabase
  ): Promise<{
    jurisdiction: Jurisdiction | null;
    taxRules: TaxRule[];
    fees: FeeCatalogItem[];
    estimatedTaxRate: number;
    estimatedFees: number;
  }> {
    const jurisdiction = await this.resolveByZip(zip, db);
    
    if (!jurisdiction) {
      return {
        jurisdiction: null,
        taxRules: [],
        fees: [],
        estimatedTaxRate: 0,
        estimatedFees: 0,
      };
    }

    const [taxRulesData, feesData] = await Promise.all([
      this.getTaxRules(jurisdiction.id, dealType, new Date(), db),
      this.getFees(jurisdiction.id, dealType, new Date(), db),
    ]);

    // Calculate estimated total tax rate (sum of all tax rates)
    const estimatedTaxRate = taxRulesData.reduce((sum, rule) => {
      return sum + parseFloat(rule.rate || '0');
    }, 0);

    // Calculate estimated total fees
    const estimatedFees = feesData.reduce((sum, fee) => {
      return sum + (fee.amountCents || 0);
    }, 0);

    return {
      jurisdiction,
      taxRules: taxRulesData,
      fees: feesData,
      estimatedTaxRate,
      estimatedFees,
    };
  }

  /**
   * Get formatted jurisdiction display string
   * @param jurisdiction - Jurisdiction object
   * @returns Formatted string like "CA (Los Angeles County, Los Angeles)"
   */
  static formatJurisdiction(jurisdiction: Jurisdiction): string {
    const parts: string[] = [jurisdiction.state];
    
    if (jurisdiction.county || jurisdiction.city) {
      const location: string[] = [];
      if (jurisdiction.county) location.push(`${jurisdiction.county} County`);
      if (jurisdiction.city) location.push(jurisdiction.city);
      parts.push(`(${location.join(', ')})`);
    }

    return parts.join(' ');
  }
}
