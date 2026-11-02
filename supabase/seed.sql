-- ====================================================================
-- AI MOCK INTERVIEW FOR WORKING PROFESSIONALS - SUPABASE SEED SCRIPT
-- ====================================================================

-- Demo User ID
DO $$
DECLARE
    v_user_id UUID := 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    v_session_sys_id UUID := 'b1c2d3e4-f5a6-7b8c-9d0e-2f3a4b5c6d7e';
    v_session_lead_id UUID := 'c1d2e3f4-a5b6-7c8d-9e0f-3a4b5c6d7e8f';
    v_q1_id UUID := 'd1e2f3a4-b5c6-7d8e-9f0a-4b5c6d7e8f9a';
    v_q2_id UUID := 'e1f2a3b4-c5d6-7e8f-9a0b-5c6d7e8f9a0b';
    v_q3_id UUID := 'f1a2b3c4-d5e6-7f8a-9b0c-6d7e8f9a0b1c';
BEGIN
    -- 1. Insert Executive Profile
    INSERT INTO public.users (
        id,
        name,
        email,
        current_role,
        years_of_experience,
        industry,
        target_role,
        resume_text,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'Sarah Jenkins',
        'sarah.jenkins@executive-candidate.io',
        'Senior Engineering Lead',
        9,
        'FinTech & High-Frequency Cloud Infrastructure',
        'Director of Engineering / Principal Systems Architect',
        'Senior Engineering Leader with 9+ years delivering Tier-0 distributed systems, real-time transaction engines (sub-15ms p99), and leading 35+ engineers across platform, SRE, and product teams. Architected cloud migrations reducing annual cloud expenditure by $1.8M while maintaining 99.995% uptime SLA.',
        now() - INTERVAL '14 days',
        now()
    ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        resume_text = EXCLUDED.resume_text;

    -- 2. Insert Completed Session 1: System Design
    INSERT INTO public.sessions (
        id,
        user_id,
        target_role,
        interview_type,
        difficulty,
        duration,
        overall_score,
        completion_status,
        created_at,
        updated_at
    ) VALUES (
        v_session_sys_id,
        v_user_id,
        'Principal Systems Architect',
        'system_design',
        'staff',
        1850, -- ~31 mins
        92.00,
        'completed',
        now() - INTERVAL '4 days',
        now() - INTERVAL '4 days'
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Questions for Session 1
    INSERT INTO public.questions (
        id,
        session_id,
        sequence_number,
        ai_question_prompt,
        competency_category,
        created_at
    ) VALUES (
        v_q1_id,
        v_session_sys_id,
        1,
        'Design a globally distributed payment ledger supporting idempotency, exactly-once processing semantics, and 20,000 writes per second with sub-50ms latency across regions.',
        'High-Scale Distributed Systems',
        now() - INTERVAL '4 days'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.questions (
        id,
        session_id,
        sequence_number,
        ai_question_prompt,
        competency_category,
        created_at
    ) VALUES (
        v_q2_id,
        v_session_sys_id,
        2,
        'How would you handle a split-brain scenario during a cross-oceanic fiber cut while transactions are actively hitting both US-East and EU-West regions?',
        'Consensus & Fault Tolerance',
        now() - INTERVAL '4 days'
    ) ON CONFLICT (id) DO NOTHING;

    -- 4. Responses for Session 1
    INSERT INTO public.responses (
        id,
        question_id,
        session_id,
        verbatim_transcript,
        duration,
        speaking_pace_wpm,
        filler_word_count,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_q1_id,
        v_session_sys_id,
        'To achieve 20k writes per second with strict idempotency and exactly-once semantics, I would separate ingestion from consensus. At the API boundary, each request carries a cryptographically hashed client idempotency key stored in a distributed Redis cluster with TTLs. For the storage layer, I would utilize a partitioned Raft-based consensus log like Spanner or CockroachDB with localized leader leases. Write operations are routed to the account owner shard, eliminating multi-shard two-phase commits for 95% of standard transactions. Read replicas handle audit queries asynchronously with bounded staleness.',
        210,
        142.50,
        1,
        now() - INTERVAL '4 days'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.responses (
        id,
        question_id,
        session_id,
        verbatim_transcript,
        duration,
        speaking_pace_wpm,
        filler_word_count,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_q2_id,
        v_session_sys_id,
        'During a cross-ocean partition, CAP theorem dictates we must prioritize Consistency over Availability for financial transfers. In a Raft or Paxos cluster with an odd quorum (e.g. 5 nodes: 2 in US, 2 in EU, 1 witness in a neutral region like Ireland or central US), only the partition retaining the majority quorum can accept writes. The minority partition immediately degrades to read-only mode for verified cache states and returns 503 retry-after headers for mutation requests. This strictly prevents divergence or double-spend anomalies.',
        195,
        138.00,
        2,
        now() - INTERVAL '4 days'
    ) ON CONFLICT DO NOTHING;

    -- 5. Evaluations for Session 1
    INSERT INTO public.evaluations (
        id,
        session_id,
        question_id,
        category_scores,
        star_adherence,
        strengths,
        improvements,
        ideal_answer,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_session_sys_id,
        v_q1_id,
        '{"technical_depth": 95, "system_scalability": 94, "communication": 90, "tradeoff_analysis": 91}'::jsonb,
        '{"situation": "Identified high-frequency distributed ledger requirements.", "task": "Architected ingestion, routing, and consensus layers.", "action": "Selected Raft-based partitioned datastore with client idempotency hash keys.", "result": "Guaranteed zero double-spend with sub-50ms localized p99.", "score": 93}'::jsonb,
        '["Crisp articulation of the separation between API idempotency and storage consensus", "Accurate trade-off evaluation between 2PC and single-shard ownership routing", "Mention of bounded staleness for read replicas"]'::jsonb,
        '["Could explicitly detail cold-start recovery mechanisms if the Redis idempotency cache fails", "Expand on database compaction and write amplification under prolonged 20k writes"]'::jsonb,
        'An executive-level answer starts by defining the SLA boundaries (availability vs consistency) and quantifying data volume (20,000 RPS * 1KB payload = ~20MB/s ingestion). It establishes a dual-tier architecture: edge load balancers verifying Bloom filters for deduplication, an in-memory distributed log (e.g., Apache Pulsar) persisting transactional intent, and a partitioned multi-leader transactional store utilizing Paxos-based deterministic locking. By sharding by customer tenant ID, cross-node distributed transactions are minimized to under 3% of global volume.',
        now() - INTERVAL '4 days'
    ) ON CONFLICT DO NOTHING;

    -- 6. Insert Completed Session 2: Leadership & Behavioral
    INSERT INTO public.sessions (
        id,
        user_id,
        target_role,
        interview_type,
        difficulty,
        duration,
        overall_score,
        completion_status,
        created_at,
        updated_at
    ) VALUES (
        v_session_lead_id,
        v_user_id,
        'Director of Engineering',
        'behavioral',
        'executive',
        1420,
        88.50,
        'completed',
        now() - INTERVAL '1 day',
        now() - INTERVAL '1 day'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.questions (
        id,
        session_id,
        sequence_number,
        ai_question_prompt,
        competency_category,
        created_at
    ) VALUES (
        v_q3_id,
        v_session_lead_id,
        1,
        'Describe a time when you had to align executive stakeholders who had fundamentally conflicting priorities on a major multi-million dollar infrastructure overhaul.',
        'Executive Stakeholder Management & Influence',
        now() - INTERVAL '1 day'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.responses (
        id,
        question_id,
        session_id,
        verbatim_transcript,
        duration,
        speaking_pace_wpm,
        filler_word_count,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_q3_id,
        v_session_lead_id,
        'At my previous company, our Chief Commercial Officer wanted immediate feature velocity for an enterprise RFP, while our VP of Security insisted on halting releases for a comprehensive cloud SOC2 compliance re-architecture. I recognized that neither could afford failure. I arranged a quantitative risk-matrix workshop. Instead of debating technical details, I framed the trade-off in business metrics: enterprise revenue at risk versus compliance liability costs. We developed a phased migration strategy where high-value RFP capabilities were containerized in the target compliant VPC first. This unblocked $4.2M in pipeline while completing 100% of audit requirements 3 weeks ahead of schedule.',
        185,
        144.00,
        0,
        now() - INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO public.evaluations (
        id,
        session_id,
        question_id,
        category_scores,
        star_adherence,
        strengths,
        improvements,
        ideal_answer,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_session_lead_id,
        v_q3_id,
        '{"leadership": 92, "stakeholder_management": 90, "strategic_clarity": 88, "executive_presence": 89}'::jsonb,
        '{"situation": "CCO and VP Security in conflict over RFP velocity vs SOC2 security freeze.", "task": "Align executives without compromising either security compliance or enterprise revenue.", "action": "Built quantitative risk-matrix and architected phased VPC rollout for priority features.", "result": "Unlocked $4.2M pipeline and finished compliance 3 weeks ahead of schedule.", "score": 94}'::jsonb,
        '["Exemplary STAR structure with quantified business impact ($4.2M pipeline)", "Framed technical problems in executive financial terms", "Zero filler words, steady professional pacing"]'::jsonb,
        '["Could mention ongoing stakeholder alignment rituals established to prevent similar bottlenecks in the future"]'::jsonb,
        'An exceptional executive response highlights strategic empathy: acknowledging both business drivers (revenue momentum) and fiduciary risk (regulatory exposure). It outlines the synthesis of differing viewpoints through data-driven options (Option A: Speed with quantified risk, Option B: Full freeze with delayed ARR, Option C: Phased hybrid with isolated blast radiuses). The candidate demonstrates poise, cross-functional leadership, and measurable top-line outcomes.',
        now() - INTERVAL '1 day'
    ) ON CONFLICT DO NOTHING;
END $$;
