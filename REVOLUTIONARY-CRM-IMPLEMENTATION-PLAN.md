# Revolutionary CRM Features - Implementation Plan

**Project**: AutolytiQ Next-Gen CRM
**Date**: 2025-10-31
**Status**: Planning Phase

---

## Executive Summary

This document outlines the implementation plan for adding revolutionary AI-powered CRM features to AutolytiQ. The platform already has strong foundational CRM capabilities. This plan builds upon that foundation to create a best-in-class, AI-first automotive CRM.

### Existing Foundation ✅

The codebase already includes:
- ✅ Customer management with detailed profiles
- ✅ Lead tracking and scoring infrastructure
- ✅ Activity and interaction logging
- ✅ Communication systems (email, SMS)
- ✅ Appointment management
- ✅ Deal tracking and optimization
- ✅ Automation framework
- ✅ ML service integration
- ✅ Event logging and outbox pattern
- ✅ Multi-tenancy support

---

## Phase 1: Core Features Enhancement

### 1.1 Unified Customer Timeline

**Goal**: Single, chronological view of all customer touchpoints

#### Database Schema Changes

```prisma
model CustomerTimeline {
  id            String   @id @default(cuid())
  tenantId      String   @map("tenant_id")
  customerId    String   @map("customer_id")
  eventType     TimelineEventType
  eventCategory TimelineCategory
  title         String
  description   String?
  metadata      Json     @default("{}")
  relatedId     String?  @map("related_id")  // Links to specific record
  relatedType   String?  @map("related_type") // Type of related record
  userId        String?  @map("user_id")      // User who triggered event
  timestamp     DateTime @default(now()) @db.Timestamptz(6)
  sentiment     String?  // positive, neutral, negative
  importance    Int      @default(50) // 0-100 score

  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer      Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  user          User?    @relation(fields: [userId], references: [id])

  @@index([tenantId, customerId, timestamp])
  @@index([relatedId, relatedType])
  @@map("customer_timeline")
}

enum TimelineEventType {
  CALL_INBOUND
  CALL_OUTBOUND
  EMAIL_SENT
  EMAIL_RECEIVED
  SMS_SENT
  SMS_RECEIVED
  WHATSAPP_SENT
  WHATSAPP_RECEIVED
  MEETING_SCHEDULED
  MEETING_COMPLETED
  MEETING_CANCELED
  WEBSITE_VISIT
  FORM_SUBMISSION
  CREDIT_PULL
  TEST_DRIVE
  VEHICLE_APPRAISAL
  OFFER_SENT
  OFFER_ACCEPTED
  OFFER_REJECTED
  DEAL_CREATED
  DEAL_UPDATED
  DEAL_WON
  DEAL_LOST
  PAYMENT_RECEIVED
  SERVICE_SCHEDULED
  SERVICE_COMPLETED
  NOTE_ADDED
  TASK_COMPLETED
  DOCUMENT_UPLOADED
  SOCIAL_INTERACTION
  THIRD_PARTY_EVENT
}

enum TimelineCategory {
  COMMUNICATION
  ACTIVITY
  DEAL
  SERVICE
  DOCUMENT
  SYSTEM
  EXTERNAL
}
```

#### API Endpoints

```typescript
// GET /api/customers/:id/timeline
// Query params: startDate, endDate, eventTypes[], category, limit, offset
// Returns: Paginated timeline events with aggregations

// POST /api/customers/:id/timeline
// Body: { eventType, title, description, metadata, sentiment }
// Returns: Created timeline event

// GET /api/customers/:id/timeline/summary
// Returns: Timeline analytics (communication frequency, response rates, etc.)
```

#### Implementation Tasks

```bash
# Backend Tasks
- [ ] Create CustomerTimeline model in schema.prisma
- [ ] Generate Prisma migration
- [ ] Create timeline service (apps/backend/src/services/timeline.service.ts)
- [ ] Implement timeline aggregation logic
- [ ] Add timeline event triggers to existing services
- [ ] Create timeline API routes
- [ ] Add WebSocket for real-time timeline updates

# Frontend Tasks
- [ ] Create TimelineView component
- [ ] Implement infinite scroll for timeline
- [ ] Add filtering and search UI
- [ ] Create event type icons and styling
- [ ] Add sentiment visualization
- [ ] Implement real-time event streaming
```

---

### 1.2 Adaptive Lead Scoring (Enhanced)

**Goal**: ML-powered, continuously recalibrating lead scores

#### Database Schema

```prisma
model LeadScoreHistory {
  id            String   @id @default(cuid())
  tenantId      String   @map("tenant_id")
  leadId        String   @map("lead_id")
  customerId    String?  @map("customer_id")
  score         Int      // 0-100
  previousScore Int?     @map("previous_score")
  scoreDelta    Int      @map("score_delta")
  factors       Json     @default("{}")  // What influenced the score
  modelVersion  String   @map("model_version")
  timestamp     DateTime @default(now()) @db.Timestamptz(6)

  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  lead          Lead?    @relation(fields: [leadId], references: [id], onDelete: Cascade)
  customer      Customer? @relation(fields: [customerId], references: [id])

  @@index([tenantId, leadId, timestamp])
  @@index([tenantId, customerId, timestamp])
  @@map("lead_score_history")
}

model LeadScoringRule {
  id          String   @id @default(cuid())
  tenantId    String   @map("tenant_id")
  name        String
  description String?
  eventType   String   @map("event_type")
  condition   Json     // JSON logic condition
  scoreImpact Int      @map("score_impact")  // +/- points
  weight      Float    @default(1.0)
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@index([tenantId, isActive])
  @@map("lead_scoring_rules")
}
```

#### ML Model Specification

```python
# apps/ml_backend/models/lead_scoring_v2.py

class AdaptiveLeadScorer:
    """
    Real-time lead scoring model that recalibrates based on:
    - Email engagement (opens, clicks, replies)
    - SMS response patterns
    - Website behavior (pages viewed, time spent, forms submitted)
    - Call outcomes and sentiment
    - Appointment attendance
    - Credit check completion
    - Deal progression
    - Time-based decay factors
    """

    features = [
        "email_open_rate_30d",
        "email_click_rate_30d",
        "email_reply_rate_30d",
        "sms_response_rate_30d",
        "website_visits_7d",
        "website_time_spent_7d",
        "pages_per_visit",
        "form_submissions_30d",
        "call_duration_avg",
        "call_sentiment_avg",
        "appointments_scheduled",
        "appointments_attended",
        "appointment_no_show_count",
        "credit_pull_completed",
        "test_drive_completed",
        "days_since_last_interaction",
        "total_interactions_30d",
        "deal_stage_progress",
        "response_time_hours_avg",
        "engagement_velocity"  # Rate of increasing engagement
    ]

    # XGBoost classifier with online learning capability
    model_type = "xgboost.XGBClassifier"
    update_frequency = "real-time"  # Updates on each significant event
```

#### API Endpoints

```typescript
// POST /api/ml/lead-score/calculate
// Body: { leadId, customerId, events[] }
// Returns: { score, factors, confidence, recommendations }

// GET /api/leads/:id/score/history
// Returns: Historical score changes with explanations

// POST /api/ml/lead-score/rules
// Body: { name, eventType, condition, scoreImpact }
// Returns: Created scoring rule

// PUT /api/ml/lead-score/rules/:id
// Updates scoring rule

// GET /api/ml/lead-score/insights
// Returns: Scoring insights and recommendations for improvement
```

---

### 1.3 Smart Task Automation

**Goal**: Auto-log routine tasks, flag only exceptions

#### Database Schema

```prisma
model AutomationRule {
  id          String   @id @default(cuid())
  tenantId    String   @map("tenant_id")
  name        String
  description String?
  trigger     Json     // Event that triggers automation
  conditions  Json     // Conditions that must be met
  actions     Json[]   // Actions to execute
  priority    Int      @default(50)
  isActive    Boolean  @default(true) @map("is_active")
  executionCount Int   @default(0) @map("execution_count")
  lastExecuted DateTime? @map("last_executed") @db.Timestamptz(6)
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  executions  AutomationExecution[]

  @@index([tenantId, isActive])
  @@map("automation_rules")
}

model TaskTemplate {
  id          String   @id @default(cuid())
  tenantId    String   @map("tenant_id")
  name        String
  description String?
  taskType    TaskType
  autoCreate  Boolean  @default(false) @map("auto_create")
  dueOffset   Int?     @map("due_offset")  // Minutes from trigger
  assignRule  Json?    @map("assign_rule")  // How to auto-assign
  priority    Int      @default(50)
  template    Json     @default("{}")

  tenant      Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("task_templates")
}

enum TaskType {
  FOLLOW_UP
  APPOINTMENT_CONFIRMATION
  DOCUMENT_COLLECTION
  CREDIT_CHECK
  INSURANCE_VERIFICATION
  DELIVERY_PREP
  POST_SALE_FOLLOW_UP
  SERVICE_REMINDER
  PAYMENT_REMINDER
  CUSTOM
}
```

#### Smart Automation Examples

```yaml
# Auto-log call outcomes
- trigger: call_completed
  conditions:
    - call_duration > 60
  actions:
    - create_activity:
        type: CALL
        auto_generated: true
    - update_timeline
    - update_lead_score

# Auto-confirm appointments
- trigger: appointment_created
  conditions:
    - time_until_appointment > 24h
  actions:
    - schedule_sms:
        template: appointment_confirmation
        send_at: "24h before"
    - schedule_sms:
        template: appointment_reminder
        send_at: "2h before"

# Auto-detect stalled deals
- trigger: deal_updated
  conditions:
    - stage_duration > 7 days
    - no_activity_in: 3 days
  actions:
    - create_alert:
        title: "Deal may be stalling"
        assignTo: sales_manager
    - suggest_action:
        type: FOLLOW_UP_CALL

# Auto-capture website leads
- trigger: form_submitted
  conditions:
    - form_type: contact
  actions:
    - create_lead
    - create_timeline_event
    - auto_assign_to_bdc
    - schedule_follow_up:
        offset: 5 minutes
```

---

## Phase 2: AI-Driven Enhancements

### 2.1 Conversational Intelligence

**Goal**: Real-time transcription, sentiment analysis, objection detection

#### Architecture

```
┌─────────────────┐
│  Phone Call     │
│  (Twilio/etc)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Speech-to-Text  │  ← Deepgram / AssemblyAI / OpenAI Whisper
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  NLP Pipeline   │
├─────────────────┤
│ • Sentiment     │  ← BERT-based model
│ • Intent        │  ← GPT-4 / Claude
│ • Objections    │  ← Custom classifier
│ • Key Topics    │  ← Topic modeling
│ • Next Steps    │  ← GPT-4 summary
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Store Results  │
│  + Timeline     │
│  + Notifications│
└─────────────────┘
```

#### Database Schema

```prisma
model Conversation {
  id              String   @id @default(cuid())
  tenantId        String   @map("tenant_id")
  customerId      String   @map("customer_id")
  userId          String?  @map("user_id")
  leadId          String?  @map("lead_id")
  dealId          String?  @map("deal_id")
  channel         ConversationChannel
  direction       ConversationDirection
  startTime       DateTime @map("start_time") @db.Timestamptz(6)
  endTime         DateTime? @map("end_time") @db.Timestamptz(6)
  duration        Int?     // seconds
  recordingUrl    String?  @map("recording_url")
  transcriptText  String?  @map("transcript_text") @db.Text
  summary         String?  @db.Text
  sentiment       String?  // positive, neutral, negative, mixed
  sentimentScore  Float?   @map("sentiment_score")
  intent          String?  // Detected customer intent
  objections      Json?    // Detected objections
  topics          String[] // Key topics discussed
  nextSteps       Json?    @map("next_steps")  // Suggested actions
  metadata        Json     @default("{}")

  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer        Customer @relation(fields: [customerId], references: [id])
  user            User?    @relation(fields: [userId], references: [id])
  lead            Lead?    @relation(fields: [leadId], references: [id])
  deal            Deal?    @relation(fields: [dealId], references: [id])
  turns           ConversationTurn[]
  insights        ConversationInsight[]

  @@index([tenantId, customerId])
  @@index([tenantId, startTime])
  @@map("conversations")
}

model ConversationTurn {
  id              String   @id @default(cuid())
  conversationId  String   @map("conversation_id")
  speaker         String   // 'agent' or 'customer'
  text            String   @db.Text
  startOffset     Int      @map("start_offset")  // milliseconds from call start
  duration        Int      // milliseconds
  sentiment       String?
  confidence      Float?

  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId, startOffset])
  @@map("conversation_turns")
}

model ConversationInsight {
  id              String   @id @default(cuid())
  conversationId  String   @map("conversation_id")
  insightType     InsightType @map("insight_type")
  category        String
  content         String   @db.Text
  severity        String?  // low, medium, high
  actionable      Boolean  @default(false)
  timestamp       DateTime @default(now()) @db.Timestamptz(6)

  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@map("conversation_insights")
}

enum ConversationChannel {
  PHONE
  VIDEO
  IN_PERSON
  CHAT
}

enum ConversationDirection {
  INBOUND
  OUTBOUND
}

enum InsightType {
  OBJECTION
  BUYING_SIGNAL
  COMPETITOR_MENTION
  PRICING_CONCERN
  FINANCING_CONCERN
  TRADE_IN_DISCUSSION
  TIMELINE_MENTION
  DECISION_MAKER
  RED_FLAG
  OPPORTUNITY
}
```

#### Real-Time Processing Flow

```typescript
// apps/backend/src/services/conversation-intelligence.service.ts

export class ConversationIntelligenceService {
  async processLiveCall(callSid: string, audioStreamUrl: string) {
    // 1. Start transcription stream
    const transcriptionStream = await this.deepgram.transcribe(audioStreamUrl);

    // 2. Real-time sentiment & intent analysis
    transcriptionStream.on('utterance', async (text, speaker) => {
      const sentiment = await this.analyzeSentiment(text);
      const intent = await this.detectIntent(text);
      const objections = await this.detectObjections(text);

      // 3. Store turn
      await this.saveTurn(callSid, speaker, text, sentiment);

      // 4. Real-time alerts
      if (objections.length > 0) {
        await this.sendAlert({
          type: 'objection_detected',
          objection: objections[0],
          suggestedResponse: await this.generateResponse(objections[0])
        });
      }

      // 5. Update timeline
      await this.updateTimeline(callSid, 'conversation_progress', {
        sentiment, intent, objections
      });
    });

    // 6. Post-call summary
    transcriptionStream.on('complete', async (fullTranscript) => {
      const summary = await this.generateSummary(fullTranscript);
      const nextSteps = await this.suggestNextSteps(fullTranscript, summary);

      await this.saveConversation(callSid, {
        transcriptText: fullTranscript,
        summary,
        nextSteps
      });
    });
  }

  async generateSummary(transcript: string): Promise<string> {
    return await this.llm.complete({
      model: 'gpt-4',
      prompt: `Summarize this sales call in 3 bullet points:
      - Customer's main interests/needs
      - Objections or concerns raised
      - Next steps agreed upon

      Transcript: ${transcript}`
    });
  }
}
```

---

### 2.2 Predictive Outreach Timing

**Goal**: ML-determined optimal contact times per lead

#### Database Schema

```prisma
model ContactPreferences {
  id                String   @id @default(cuid())
  tenantId          String   @map("tenant_id")
  customerId        String   @unique @map("customer_id")

  // Learned preferences
  bestCallTime      Json?    @map("best_call_time")     // { dayOfWeek, hourRange }
  bestEmailTime     Json?    @map("best_email_time")
  bestSmsTime       Json?    @map("best_sms_time")

  // Response patterns
  avgResponseTime   Int?     @map("avg_response_time")  // minutes
  callAnswerRate    Float?   @map("call_answer_rate")
  emailOpenRate     Float?   @map("email_open_rate")
  smsResponseRate   Float?   @map("sms_response_rate")

  // Timezone & availability
  timezone          String?
  workingHours      Json?    @map("working_hours")      // Business hours
  doNotDisturb      Json?    @map("do_not_disturb")     // DND times

  // Model metadata
  modelVersion      String?  @map("model_version")
  lastUpdated       DateTime @updatedAt @map("last_updated") @db.Timestamptz(6)
  sampleSize        Int      @default(0) @map("sample_size")  // # of interactions analyzed

  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer          Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@map("contact_preferences")
}

model OutreachSchedule {
  id              String   @id @default(cuid())
  tenantId        String   @map("tenant_id")
  customerId      String   @map("customer_id")
  userId          String?  @map("user_id")
  channel         String   // email, sms, call
  scheduledFor    DateTime @map("scheduled_for") @db.Timestamptz(6)
  purpose         String   // follow_up, reminder, offer, etc.
  message         String?  @db.Text
  status          String   @default("pending")
  confidence      Float?   // Predicted success probability
  actualSent      DateTime? @map("actual_sent") @db.Timestamptz(6)
  response        Boolean?
  responseTime    Int?     @map("response_time")  // minutes

  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer        Customer @relation(fields: [customerId], references: [id])

  @@index([tenantId, customerId, scheduledFor])
  @@index([tenantId, scheduledFor, status])
  @@map("outreach_schedule")
}
```

#### ML Model

```python
# apps/ml_backend/models/outreach_timing.py

class OptimalOutreachPredictor:
    """
    Predicts optimal outreach times based on:
    - Historical response patterns
    - Day of week patterns
    - Time of day patterns
    - Channel-specific patterns
    - Seasonal variations
    - Individual vs. cohort patterns
    """

    def predict_optimal_time(
        self,
        customer_id: str,
        channel: str,
        purpose: str,
        constraints: dict
    ) -> dict:
        # Get customer's historical patterns
        patterns = self.get_response_patterns(customer_id, channel)

        # Get cohort patterns if individual data is sparse
        if patterns['sample_size'] < 10:
            patterns = self.get_cohort_patterns(customer_id, channel)

        # Generate probability distribution over next 7 days
        time_slots = self.generate_time_slots(constraints)
        probabilities = self.model.predict_proba(time_slots, patterns)

        # Select top 3 recommended times
        top_times = self.rank_times(time_slots, probabilities)

        return {
            'recommended_time': top_times[0],
            'alternatives': top_times[1:3],
            'confidence': probabilities[top_times[0]],
            'reasoning': self.explain_recommendation(top_times[0], patterns)
        }
```

#### API Endpoints

```typescript
// POST /api/ml/outreach/predict-timing
// Body: { customerId, channel, purpose, constraints }
// Returns: { recommendedTime, alternatives, confidence, reasoning }

// POST /api/outreach/schedule
// Body: { customerId, channel, message, preferOptimalTime: true }
// Returns: Scheduled outreach with predicted optimal time

// GET /api/customers/:id/contact-preferences
// Returns: Learned contact preferences

// PUT /api/customers/:id/contact-preferences
// Manually override preferences
```

---

### 2.3 Auto-Personalized Messaging

**Goal**: AI-generated, contextual messages that scale

#### Database Schema

```prisma
model MessageTemplate {
  id            String   @id @default(cuid())
  tenantId      String   @map("tenant_id")
  name          String
  description   String?
  channel       String   // email, sms, whatsapp
  purpose       String   // follow_up, appointment, offer, etc.
  template      String   @db.Text  // Template with {{variables}}
  aiEnabled     Boolean  @default(false) @map("ai_enabled")
  tone          String?  // professional, friendly, casual, urgent
  variables     Json     @default("[]")  // Required variables
  performance   Json?    // Response rates, conversion

  tenant        Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("message_templates")
}

model GeneratedMessage {
  id              String   @id @default(cuid())
  tenantId        String   @map("tenant_id")
  customerId      String   @map("customer_id")
  templateId      String?  @map("template_id")
  channel         String
  subject         String?
  content         String   @db.Text
  variables       Json     @default("{}")
  context         Json     @default("{}")  // Customer context used
  generatedBy     String   @map("generated_by")  // ai | user
  modelVersion    String?  @map("model_version")
  sentiment       String?
  tone            String?
  sent            Boolean  @default(false)
  sentAt          DateTime? @map("sent_at") @db.Timestamptz(6)
  opened          Boolean?
  openedAt        DateTime? @map("opened_at") @db.Timestamptz(6)
  clicked         Boolean?
  replied         Boolean?
  converted       Boolean?

  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer        Customer @relation(fields: [customerId], references: [id])

  @@index([tenantId, customerId])
  @@map("generated_messages")
}
```

#### AI Message Generation

```typescript
// apps/backend/src/services/message-generation.service.ts

export class MessageGenerationService {
  async generatePersonalizedMessage(params: {
    customerId: string;
    purpose: string;
    channel: string;
    tone?: string;
    context?: any;
  }): Promise<string> {
    // 1. Gather customer context
    const customer = await this.getCustomerProfile(params.customerId);
    const timeline = await this.getRecentTimeline(params.customerId, 30);
    const interactions = await this.getInteractionSummary(params.customerId);
    const preferences = await this.getContactPreferences(params.customerId);

    // 2. Build context for LLM
    const context = {
      customer: {
        name: customer.firstName,
        lastInteraction: timeline[0],
        interests: this.extractInterests(timeline),
        stage: customer.leadStatus,
        vehicleInterest: this.getVehicleInterest(customer)
      },
      history: {
        communicationCount: interactions.count,
        avgResponseTime: interactions.avgResponseTime,
        preferredChannel: preferences.preferredChannel
      },
      business: {
        dealershipName: this.tenant.name,
        currentOffers: await this.getCurrentOffers()
      }
    };

    // 3. Generate message with GPT-4
    const message = await this.llm.complete({
      model: 'gpt-4',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `You are a helpful automotive sales assistant. Generate a ${params.tone || 'professional'} ${params.channel} message for the ${params.purpose} purpose.

Rules:
- Keep it concise (${params.channel === 'sms' ? '160 chars max' : 'under 200 words'})
- Reference recent interactions naturally
- Include clear call-to-action
- Match customer's communication style
- Never use generic greetings
- Personalize based on context`
        },
        {
          role: 'user',
          content: `Generate a message with this context: ${JSON.stringify(context)}`
        }
      ]
    });

    // 4. Validate and refine
    const validated = await this.validateMessage(message, params.channel);

    // 5. Store for tracking
    await this.saveGeneratedMessage({
      ...params,
      content: validated,
      context,
      generatedBy: 'ai'
    });

    return validated;
  }
}
```

---

### 2.4 Opportunity Forecasting

**Goal**: Predict deal closure likelihood with explainability

#### Database Schema

```prisma
model DealForecast {
  id                String   @id @default(cuid())
  tenantId          String   @map("tenant_id")
  dealId            String   @map("deal_id")

  // Predictions
  closeProbability  Float    @map("close_probability")  // 0-1
  expectedValue     Decimal  @map("expected_value") @db.Decimal(18, 2)
  expectedCloseDate DateTime? @map("expected_close_date") @db.Date
  riskLevel         String   @map("risk_level")  // low, medium, high

  // Feature importance
  factors           Json     // What drives the prediction
  risks             Json[]   // Identified risks
  opportunities     Json[]   // Upsell opportunities

  // Model metadata
  modelVersion      String   @map("model_version")
  confidence        Float
  generatedAt       DateTime @default(now()) @map("generated_at") @db.Timestamptz(6)

  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  deal              Deal     @relation(fields: [dealId], references: [id], onDelete: Cascade)

  @@index([tenantId, dealId])
  @@index([tenantId, generatedAt])
  @@map("deal_forecasts")
}

model PipelineForecast {
  id                String   @id @default(cuid())
  tenantId          String   @map("tenant_id")
  userId            String?  @map("user_id")
  forecastDate      DateTime @map("forecast_date") @db.Date

  // Aggregate predictions
  totalValue        Decimal  @map("total_value") @db.Decimal(18, 2)
  expectedValue     Decimal  @map("expected_value") @db.Decimal(18, 2)
  highProbDeals     Int      @map("high_prob_deals")
  mediumProbDeals   Int      @map("medium_prob_deals")
  lowProbDeals      Int      @map("low_prob_deals")
  atRiskDeals       Int      @map("at_risk_deals")

  // Breakdown by stage
  stageBreakdown    Json     @map("stage_breakdown")

  // Historical comparison
  vs30DaysAgo       Json?    @map("vs_30_days_ago")

  generatedAt       DateTime @default(now()) @map("generated_at") @db.Timestamptz(6)

  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  user              User?    @relation(fields: [userId], references: [id])

  @@index([tenantId, forecastDate])
  @@map("pipeline_forecasts")
}
```

#### ML Model

```python
# apps/ml_backend/models/deal_forecasting.py

class DealCloseProbabilityModel:
    """
    Predicts deal closure probability using:
    - Deal characteristics (age, stage, value)
    - Customer engagement metrics
    - Rep performance history
    - Seasonal patterns
    - External market signals
    """

    features = [
        # Deal features
        "deal_age_days",
        "deal_value",
        "stage_duration_days",
        "stage_progression_rate",
        "price_negotiation_rounds",
        "trade_in_value_ratio",

        # Customer features
        "customer_engagement_score",
        "communication_frequency",
        "response_rate",
        "credit_score",
        "financing_approved",
        "test_drive_completed",

        # Rep features
        "rep_close_rate_90d",
        "rep_avg_cycle_time",
        "rep_customer_satisfaction",

        # Temporal features
        "day_of_week",
        "month",
        "days_to_month_end",
        "market_demand_index",

        # Historical patterns
        "similar_deals_close_rate",
        "vehicle_type_close_rate",
        "price_point_close_rate"
    ]

    def predict_with_explanation(self, deal_id: str) -> dict:
        # Get deal data
        deal = self.get_deal_data(deal_id)
        features = self.extract_features(deal)

        # Predict
        probability = self.model.predict_proba([features])[0][1]

        # SHAP explanation
        shap_values = self.explainer.shap_values(features)
        feature_importance = self.rank_features(shap_values)

        # Identify risks
        risks = self.identify_risks(features, shap_values)

        # Suggest actions
        actions = self.recommend_actions(features, risks)

        return {
            "probability": probability,
            "expected_value": deal.value * probability,
            "risk_level": self.categorize_risk(probability, risks),
            "factors": feature_importance,
            "risks": risks,
            "recommended_actions": actions,
            "confidence": self.calculate_confidence(features)
        }
```

---

### 2.5 Churn Prediction & Retention

**Goal**: Detect customers at risk of churning, trigger retention

#### Database Schema

```prisma
model ChurnPrediction {
  id                String   @id @default(cuid())
  tenantId          String   @map("tenant_id")
  customerId        String   @map("customer_id")

  // Prediction
  churnProbability  Float    @map("churn_probability")  // 0-1
  riskLevel         String   @map("risk_level")  // low, medium, high, critical
  predictedChurnDate DateTime? @map("predicted_churn_date") @db.Date

  // Signals
  churnSignals      Json[]   @map("churn_signals")
  engagementTrend   String   @map("engagement_trend")  // increasing, stable, declining
  lastInteraction   DateTime @map("last_interaction") @db.Timestamptz(6)
  daysSinceContact  Int      @map("days_since_contact")

  // Recommendations
  retentionStrategy Json?    @map("retention_strategy")
  suggestedActions  Json[]   @map("suggested_actions")
  estimatedValue    Decimal? @map("estimated_value") @db.Decimal(18, 2)

  // Model metadata
  modelVersion      String   @map("model_version")
  confidence        Float
  generatedAt       DateTime @default(now()) @map("generated_at") @db.Timestamptz(6)

  // Outcome tracking
  retentionAttempted Boolean @default(false) @map("retention_attempted")
  wasRetained       Boolean? @map("was_retained")
  actualChurnDate   DateTime? @map("actual_churn_date") @db.Date

  tenant            Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer          Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@index([tenantId, customerId])
  @@index([tenantId, riskLevel, generatedAt])
  @@map("churn_predictions")
}

model RetentionCampaign {
  id              String   @id @default(cuid())
  tenantId        String   @map("tenant_id")
  customerId      String   @map("customer_id")
  churnPredictionId String? @map("churn_prediction_id")

  // Campaign details
  campaignType    String   @map("campaign_type")
  strategy        Json     // Retention strategy
  actions         Json[]   // Specific actions taken
  offerDetails    Json?    @map("offer_details")

  // Status
  status          String   @default("active")
  startedAt       DateTime @default(now()) @map("started_at") @db.Timestamptz(6)
  completedAt     DateTime? @map("completed_at") @db.Timestamptz(6)

  // Outcome
  wasSuccessful   Boolean? @map("was_successful")
  retainedValue   Decimal? @map("retained_value") @db.Decimal(18, 2)
  notes           String?  @db.Text

  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer        Customer @relation(fields: [customerId], references: [id])

  @@index([tenantId, status])
  @@map("retention_campaigns")
}
```

---

## Phase 3: Streamlined Experience

### 3.1 Voice-to-Action

**Goal**: Natural language commands create CRM actions

#### Architecture

```typescript
// apps/backend/src/services/voice-command.service.ts

export class VoiceCommandService {
  async processVoiceCommand(audioUrl: string, userId: string): Promise<any> {
    // 1. Speech to text
    const text = await this.whisper.transcribe(audioUrl);

    // 2. Intent classification
    const intent = await this.classifyIntent(text);

    // 3. Entity extraction
    const entities = await this.extractEntities(text);

    // 4. Execute action
    return await this.executeAction(intent, entities, userId);
  }

  async classifyIntent(text: string): Promise<Intent> {
    // Use GPT-4 for intent classification
    const response = await this.llm.complete({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: `Classify the user's intent from this voice command.

Available intents:
- CREATE_FOLLOWUP
- SCHEDULE_APPOINTMENT
- SEND_MESSAGE
- UPDATE_DEAL
- LOG_NOTE
- SEARCH_CUSTOMER
- CREATE_TASK

Return JSON: { intent, confidence, entities }`
      }, {
        role: 'user',
        content: text
      }]
    });

    return JSON.parse(response);
  }

  async executeAction(intent: Intent, entities: any, userId: string) {
    switch (intent.type) {
      case 'CREATE_FOLLOWUP':
        return await this.createFollowUp({
          customerId: entities.customer,
          scheduledFor: entities.datetime,
          note: entities.note,
          userId
        });

      case 'SCHEDULE_APPOINTMENT':
        return await this.scheduleAppointment({
          customerId: entities.customer,
          datetime: entities.datetime,
          type: entities.appointmentType,
          userId
        });

      case 'SEND_MESSAGE':
        const message = await this.generateMessage({
          customerId: entities.customer,
          purpose: entities.purpose,
          keyPoints: entities.keyPoints
        });
        return await this.sendMessage(message);

      // ... other actions
    }
  }
}
```

#### Supported Commands

```
Examples:
"Create a follow-up for John Thursday at 4, mention the financing offer"
"Schedule a test drive with Sarah tomorrow at 2pm"
"Send a text to Mike about the trade-in value we discussed"
"Update the Johnson deal to financing stage"
"Log a note: customer wants to see the vehicle this weekend"
"Find all leads from this month with high scores"
"Create a task to call back the customer in 2 hours"
```

---

### 3.2 Visual Pipeline & Deal Health

**Goal**: Replace static Kanban with dynamic health visualization

#### Frontend Component

```typescript
// apps/frontend/src/components/DealHealthPipeline.tsx

interface DealHealth {
  dealId: string;
  health: 'green' | 'yellow' | 'red';
  score: number;  // 0-100
  indicators: {
    engagement: 'high' | 'medium' | 'low';
    momentum: 'accelerating' | 'stable' | 'slowing' | 'stalled';
    risk: 'low' | 'medium' | 'high';
  };
  warnings: string[];
  opportunities: string[];
}

export const DealHealthPipeline = () => {
  // Real-time health updates via WebSocket
  const { deals, subscribe } = useDealHealthStream();

  useEffect(() => {
    const unsubscribe = subscribe((update) => {
      // Update deal health in real-time
      updateDealHealth(update.dealId, update.health);
    });
    return unsubscribe;
  }, []);

  return (
    <PipelineView>
      {stages.map(stage => (
        <StageColumn key={stage.id} stage={stage}>
          {deals.filter(d => d.stage === stage.id).map(deal => (
            <DealCard
              key={deal.id}
              deal={deal}
              health={deal.health}
              onHealthClick={() => showHealthDetails(deal)}
            >
              <HealthIndicator color={deal.health.color}>
                <HealthScore value={deal.health.score} />
                <MomentumBadge trend={deal.health.indicators.momentum} />
              </HealthIndicator>

              {deal.health.warnings.length > 0 && (
                <WarningBanner warnings={deal.health.warnings} />
              )}

              {deal.health.opportunities.length > 0 && (
                <OpportunityBadge count={deal.health.opportunities.length} />
              )}
            </DealCard>
          ))}
        </StageColumn>
      ))}
    </PipelineView>
  );
};
```

#### Health Calculation Logic

```typescript
// apps/backend/src/services/deal-health.service.ts

export class DealHealthService {
  async calculateDealHealth(dealId: string): Promise<DealHealth> {
    const deal = await this.getDeal(dealId);
    const metrics = await this.getDealMetrics(dealId);

    // Calculate sub-scores
    const engagement = this.calculateEngagementScore(metrics);
    const momentum = this.calculateMomentumScore(metrics);
    const risk = this.calculateRiskScore(metrics);
    const timeInStage = this.getTimeInStage(deal);

    // Weighted overall health score
    const healthScore = (
      engagement * 0.30 +
      momentum * 0.30 +
      (100 - risk) * 0.25 +
      this.stageProgressScore(timeInStage) * 0.15
    );

    // Determine color
    let color: 'green' | 'yellow' | 'red';
    if (healthScore >= 70) color = 'green';
    else if (healthScore >= 40) color = 'yellow';
    else color = 'red';

    // Identify warnings
    const warnings = [];
    if (timeInStage > 14) warnings.push('Deal in stage > 14 days');
    if (metrics.daysSinceContact > 3) warnings.push('No contact in 3+ days');
    if (metrics.appointmentNoShows > 1) warnings.push('Multiple no-shows');
    if (metrics.competitorMentions > 0) warnings.push('Competitor mentioned');

    // Identify opportunities
    const opportunities = [];
    if (metrics.highEngagement && !deal.testDriveCompleted) {
      opportunities.push('Schedule test drive');
    }
    if (metrics.financingPreApproved && deal.stage === 'negotiation') {
      opportunities.push('Move to financing stage');
    }

    return {
      dealId,
      health: color,
      score: Math.round(healthScore),
      indicators: {
        engagement: this.categorizeEngagement(engagement),
        momentum: this.categorizeMomentum(momentum),
        risk: this.categorizeRisk(risk)
      },
      warnings,
      opportunities
    };
  }
}
```

---

### 3.3 Cross-Channel Sync

**Goal**: Unified inbox across all communication channels

#### Database Schema

```prisma
model UnifiedMessage {
  id              String   @id @default(cuid())
  tenantId        String   @map("tenant_id")
  customerId      String   @map("customer_id")
  userId          String?  @map("user_id")

  // Channel info
  channel         MessageChannel
  channelMessageId String? @map("channel_message_id")  // ID in source system
  direction       MessageDirection

  // Content
  subject         String?
  body            String   @db.Text
  attachments     Json[]
  metadata        Json     @default("{}")

  // Status
  status          MessageStatus
  sentAt          DateTime? @map("sent_at") @db.Timestamptz(6)
  deliveredAt     DateTime? @map("delivered_at") @db.Timestamptz(6)
  readAt          DateTime? @map("read_at") @db.Timestamptz(6)
  repliedAt       DateTime? @map("replied_at") @db.Timestamptz(6)

  // Threading
  threadId        String?  @map("thread_id")
  inReplyTo       String?  @map("in_reply_to")

  // Classification
  sentiment       String?
  intent          String?
  priority        Int      @default(50)
  requiresAction  Boolean  @default(false) @map("requires_action")

  createdAt       DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  tenant          Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  customer        Customer @relation(fields: [customerId], references: [id])
  user            User?    @relation(fields: [userId], references: [id])
  replies         UnifiedMessage[] @relation("MessageThread")
  parentMessage   UnifiedMessage? @relation("MessageThread", fields: [inReplyTo], references: [id])

  @@index([tenantId, customerId, createdAt])
  @@index([tenantId, userId, status])
  @@index([threadId])
  @@map("unified_messages")
}

enum MessageChannel {
  EMAIL
  SMS
  WHATSAPP
  FACEBOOK
  INSTAGRAM
  PHONE
  IN_APP_CHAT
  WEBSITE_CHAT
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}

enum MessageStatus {
  DRAFT
  QUEUED
  SENDING
  SENT
  DELIVERED
  READ
  FAILED
}
```

---

## Phase 4: Revolutionary Layer

### 4.1 Generative Deal Coaching

**Goal**: Real-time AI coaching during sales process

```typescript
// Real-time coaching websocket
socket.on('deal:interaction', async (data) => {
  const coaching = await coachingService.getRealtimeCoaching({
    dealId: data.dealId,
    context: data.context,
    currentStage: data.stage
  });

  socket.emit('coaching:suggestion', coaching);
});
```

### 4.2 Customer Digital Twin

**Goal**: Predictive customer models for testing approaches

```typescript
interface CustomerDigitalTwin {
  customerId: string;
  personality: {
    decisionStyle: 'analytical' | 'decisive' | 'collaborative' | 'emotional';
    priceSensitivity: number;  // 0-100
    brandLoyalty: string[];
    communicationPreference: 'detailed' | 'concise';
  };
  predictedResponses: {
    toDiscount: (amount: number) => number;  // Probability of acceptance
    toFinancing: (terms: any) => number;
    toTradeOffer: (value: number) => number;
    toUpsell: (product: string) => number;
  };
  simulateConversation: (approach: string) => ConversationOutcome;
}
```

### 4.3 Closed-Loop Learning

**Goal**: Continuous model improvement from outcomes

```typescript
// Feedback loop on every outcome
await ml.recordOutcome({
  predictionId: prediction.id,
  actualOutcome: 'won',
  actualValue: deal.finalValue,
  actualCloseDate: deal.closedAt,
  feedback: {
    predictionAccuracy: calculateAccuracy(prediction, actual),
    factorsCorrect: compareFactors(prediction.factors, actual),
    missedSignals: identifyMissedSignals(timeline, actual)
  }
});

// Trigger model retraining when drift detected
if (performanceMetrics.accuracy < threshold) {
  await ml.scheduleRetraining({
    model: 'deal_forecasting',
    reason: 'performance_degradation',
    newData: getRecentOutcomes(1000)
  });
}
```

---

## Implementation Roadmap

### Sprint 1-2: Foundation (Weeks 1-2)
- [ ] Database schema updates
- [ ] Customer timeline backend
- [ ] Enhanced lead scoring model
- [ ] Basic task automation rules

### Sprint 3-4: AI Core (Weeks 3-4)
- [ ] Conversation intelligence integration
- [ ] Message generation service
- [ ] Outreach timing model
- [ ] Deal forecasting MVP

### Sprint 5-6: User Experience (Weeks 5-6)
- [ ] Timeline UI component
- [ ] Deal health visualization
- [ ] Unified inbox
- [ ] Voice-to-action

### Sprint 7-8: Advanced Features (Weeks 7-8)
- [ ] Churn prediction system
- [ ] Real-time coaching
- [ ] Digital twin framework
- [ ] Closed-loop learning

### Sprint 9-10: Polish & Launch (Weeks 9-10)
- [ ] Performance optimization
- [ ] User testing and feedback
- [ ] Documentation
- [ ] Gradual rollout

---

## Technology Stack

### ML/AI Services
- **Speech-to-Text**: Deepgram / AssemblyAI
- **LLM**: GPT-4, Claude 3.5 Sonnet
- **ML Models**: XGBoost, scikit-learn, TensorFlow
- **Embeddings**: OpenAI Ada, Sentence Transformers
- **Explainability**: SHAP, LIME

### Real-Time Processing
- **WebSockets**: Socket.io
- **Message Queue**: Redis Bull
- **Streaming**: Server-Sent Events
- **Caching**: Redis

### Infrastructure
- **Database**: PostgreSQL (existing)
- **Vector Store**: Pinecone / pgvector
- **Object Storage**: S3 / MinIO
- **Monitoring**: Prometheus, Grafana (existing)

---

## Success Metrics

### Core Features
- **Timeline**: 100% of interactions captured, < 1s load time
- **Lead Scoring**: 85%+ prediction accuracy, < 2s compute time
- **Automation**: 70%+ reduction in manual task logging

### AI Features
- **Conversation Intelligence**: 95%+ transcription accuracy
- **Message Generation**: 60%+ response rate vs templates
- **Outreach Timing**: 40%+ improvement in contact rate
- **Deal Forecasting**: 80%+ accuracy within ±10%

### User Experience
- **Voice-to-Action**: < 3s command-to-execution
- **Deal Health**: 90%+ accuracy in risk identification
- **Cross-Channel**: Zero message loss, < 5s sync time

---

## Next Steps

1. **Review & Approve** this plan
2. **Prioritize features** based on business impact
3. **Assign development team** resources
4. **Set up project tracking** (Jira/Linear)
5. **Begin Sprint 1** with foundation work

---

**Document Version**: 1.0
**Last Updated**: 2025-10-31
**Owner**: Engineering Team
**Status**: Awaiting Approval
