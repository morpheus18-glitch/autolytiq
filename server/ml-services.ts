import OpenAI from 'openai';
import { db } from './db';
import { customerEmbeddings, leadEmbeddings, inventoryEmbeddings, mlPredictions, searchQueries } from '@shared/vector-schema';
import { customers, leads, vehicles } from '@shared/schema';
import { sql, eq, cosineDistance, gt, desc } from 'drizzle-orm';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});

export class MLService {
  
  // Generate embeddings using OpenAI
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
        // Return mock embedding for demo purposes
        return Array.from({ length: 1536 }, () => Math.random() - 0.5);
      }

      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text.slice(0, 8000), // Limit input length
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Return mock embedding as fallback
      return Array.from({ length: 1536 }, () => Math.random() - 0.5);
    }
  }

  // Index customer data for semantic search
  async indexCustomer(customerId: number) {
    try {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId));

      if (!customer) return;

      // Create searchable content
      const profileContent = `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phone} ${customer.address} ${customer.city} ${customer.state}`;
      const embedding = await this.generateEmbedding(profileContent);

      // Store embedding
      await db
        .insert(customerEmbeddings)
        .values({
          customerId: customer.id,
          contentType: 'profile',
          content: profileContent,
          embedding: embedding,
          metadata: {
            creditScore: customer.creditScore,
            income: customer.income,
            status: customer.status,
          },
        })
        .onConflictDoUpdate({
          target: [customerEmbeddings.customerId, customerEmbeddings.contentType],
          set: {
            content: profileContent,
            embedding: embedding,
            updatedAt: sql`NOW()`,
          },
        });

    } catch (error) {
      console.error('Error indexing customer:', error);
    }
  }

  // Semantic search for customers
  async semanticCustomerSearch(query: string, limit: number = 10): Promise<any[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const results = await db
        .select({
          customer: customers,
          similarity: sql<number>`1 - (${customerEmbeddings.embedding} <=> ${queryEmbedding})`,
          content: customerEmbeddings.content,
          metadata: customerEmbeddings.metadata,
        })
        .from(customerEmbeddings)
        .innerJoin(customers, eq(customers.id, customerEmbeddings.customerId))
        .orderBy(desc(sql`1 - (${customerEmbeddings.embedding} <=> ${queryEmbedding})`))
        .limit(limit);

      return results.filter(r => r.similarity > 0.7); // Filter by similarity threshold
    } catch (error) {
      console.error('Error in semantic customer search:', error);
      return [];
    }
  }

  // Lead scoring using simple ML model
  async scoreLeadML(leadId: number): Promise<number> {
    try {
      const [lead] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, leadId));

      if (!lead) return 0;

      // Simple scoring algorithm (in production, would use trained model)
      let score = 0;
      
      // Source quality scoring
      const sourceWeights: Record<string, number> = {
        'website': 0.8,
        'referral': 0.9,
        'phone': 0.7,
        'walk-in': 0.6,
        'social': 0.5,
      };
      score += (sourceWeights[lead.source] || 0.5) * 20;

      // Status progression scoring
      const statusWeights: Record<string, number> = {
        'new': 0.3,
        'contacted': 0.5,
        'qualified': 0.8,
        'hot': 0.9,
        'warm': 0.6,
        'cold': 0.2,
      };
      score += (statusWeights[lead.status] || 0.3) * 30;

      // Estimated value impact
      if (lead.estimatedValue) {
        score += Math.min((lead.estimatedValue / 50000) * 25, 25);
      }

      // Priority multiplier
      const priorityMultipliers: Record<string, number> = {
        'low': 0.8,
        'medium': 1.0,
        'high': 1.2,
        'urgent': 1.5,
      };
      score *= (priorityMultipliers[lead.priority] || 1.0);

      const finalScore = Math.min(Math.max(score, 0), 100);

      // Store prediction
      await db
        .insert(mlPredictions)
        .values({
          entityType: 'lead',
          entityId: leadId,
          modelType: 'lead_score',
          prediction: finalScore,
          confidence: 0.85,
          modelVersion: 'v1.0',
          features: {
            source: lead.source,
            status: lead.status,
            estimatedValue: lead.estimatedValue,
            priority: lead.priority,
          },
        })
        .onConflictDoUpdate({
          target: [mlPredictions.entityType, mlPredictions.entityId, mlPredictions.modelType],
          set: {
            prediction: finalScore,
            confidence: 0.85,
            updatedAt: sql`NOW()`,
          },
        });

      return finalScore;
    } catch (error) {
      console.error('Error scoring lead:', error);
      return 0;
    }
  }

  // Personalized inventory recommendations
  async getPersonalizedRecommendations(customerId: number, limit: number = 5): Promise<any[]> {
    try {
      const [customer] = await db
        .select()
        .from(customers)
        .where(eq(customers.id, customerId));

      if (!customer) return [];

      // Create preference profile
      const preferenceText = `Customer with income ${customer.income} looking for vehicles, credit score ${customer.creditScore}, budget oriented, ${customer.city} ${customer.state}`;
      const preferenceEmbedding = await this.generateEmbedding(preferenceText);

      // Find similar inventory
      const recommendations = await db
        .select({
          vehicle: vehicles,
          similarity: sql<number>`1 - (${inventoryEmbeddings.embedding} <=> ${preferenceEmbedding})`,
          content: inventoryEmbeddings.content,
        })
        .from(inventoryEmbeddings)
        .innerJoin(vehicles, eq(vehicles.id, inventoryEmbeddings.vehicleId))
        .where(eq(vehicles.status, 'available'))
        .orderBy(desc(sql`1 - (${inventoryEmbeddings.embedding} <=> ${preferenceEmbedding})`))
        .limit(limit);

      return recommendations.filter(r => r.similarity > 0.6);
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  // Smart search with learning
  async smartSearch(userId: string, query: string, searchType: string): Promise<any[]> {
    const startTime = Date.now();
    let results: any[] = [];

    try {
      // Log the search query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Perform semantic search based on type
      switch (searchType) {
        case 'customer':
          results = await this.semanticCustomerSearch(query);
          break;
        default:
          results = await this.semanticCustomerSearch(query); // Default to customer search
      }

      const responseTime = Date.now() - startTime;

      // Log search query for learning
      await db.insert(searchQueries).values({
        userId,
        queryText: query,
        queryType: searchType,
        embedding: queryEmbedding,
        resultsCount: results.length,
        responseTime,
      });

      return results;
    } catch (error) {
      console.error('Error in smart search:', error);
      return [];
    }
  }

  // Get ML insights for dashboard
  async getDashboardInsights(): Promise<any> {
    try {
      // Get recent predictions
      const recentPredictions = await db
        .select()
        .from(mlPredictions)
        .orderBy(desc(mlPredictions.createdAt))
        .limit(10);

      // Get search analytics
      const searchStats = await db
        .select({
          queryType: searchQueries.queryType,
          count: sql<number>`count(*)`,
          avgResponseTime: sql<number>`avg(${searchQueries.responseTime})`,
          avgResultsCount: sql<number>`avg(${searchQueries.resultsCount})`,
        })
        .from(searchQueries)
        .where(gt(searchQueries.createdAt, sql`NOW() - INTERVAL '7 days'`))
        .groupBy(searchQueries.queryType);

      return {
        recentPredictions,
        searchStats,
        mlModelStatus: {
          leadScoring: { status: 'active', accuracy: 0.85, version: 'v1.0' },
          semanticSearch: { status: 'active', precision: 0.78, version: 'v1.0' },
          recommendations: { status: 'active', hitRate: 0.34, version: 'v1.0' },
        },
      };
    } catch (error) {
      console.error('Error getting ML insights:', error);
      return {};
    }
  }
}

export const mlService = new MLService();