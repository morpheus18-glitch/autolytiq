export type ComplianceItemType = 'document' | 'training' | 'audit' | 'certification'
export type ComplianceStatus = 'compliant' | 'warning' | 'non-compliant' | 'pending'

export interface ComplianceItem {
  id: string
  type: ComplianceItemType
  title: string
  status: ComplianceStatus
  dueDate: string
  lastUpdated: string
  assignedTo: string
  description: string
  relatedDocuments?: Array<{
    name: string
    url: string
    version: string
    lastReviewed: string
  }>
}

export const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: '1',
    type: 'document',
    title: 'Truth in Lending Act Documentation',
    status: 'compliant',
    dueDate: '2025-03-15',
    lastUpdated: '2025-01-15',
    assignedTo: 'F&I Manager',
    description: 'Ensure all lending documentation meets TILA requirements',
    relatedDocuments: [
      {
        name: 'TILA disclosure template',
        url: '/assets/compliance/tila-disclosure.pdf',
        version: 'v4.2',
        lastReviewed: '2024-12-18'
      }
    ]
  },
  {
    id: '2',
    type: 'training',
    title: 'Fair Credit Reporting Act Training',
    status: 'warning',
    dueDate: '2025-02-01',
    lastUpdated: '2024-11-15',
    assignedTo: 'Sales Team',
    description: 'Annual FCRA compliance training for sales staff',
    relatedDocuments: [
      {
        name: 'FCRA training curriculum',
        url: '/assets/compliance/fcra-training.pdf',
        version: 'v2.8',
        lastReviewed: '2024-10-04'
      }
    ]
  },
  {
    id: '3',
    type: 'certification',
    title: 'Dealer License Renewal',
    status: 'pending',
    dueDate: '2025-04-30',
    lastUpdated: '2025-01-10',
    assignedTo: 'General Manager',
    description: 'State dealer license renewal application',
    relatedDocuments: [
      {
        name: 'License renewal packet',
        url: '/assets/compliance/dealer-license-renewal.pdf',
        version: '2025',
        lastReviewed: '2025-01-05'
      }
    ]
  },
  {
    id: '4',
    type: 'audit',
    title: 'F&I Process Audit',
    status: 'non-compliant',
    dueDate: '2025-01-25',
    lastUpdated: '2025-01-20',
    assignedTo: 'F&I Manager',
    description: 'Internal audit of F&I processes and documentation',
    relatedDocuments: [
      {
        name: 'F&I process checklist',
        url: '/assets/compliance/fi-audit-checklist.xlsx',
        version: 'v3.1',
        lastReviewed: '2025-01-11'
      }
    ]
  }
]
