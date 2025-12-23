<!-- TODO translate into different languages and check grammar -->

# Civic OS Master Validation Survey

> **Survey Goal:** Determine product launch priority (Connect vs Love vs Quest), validate pain points, identify marketing angles, and test network effects assumptions.
>
> **Estimated Time:** 15-20 minutes  
> **Incentive:** Enter raffle for 10x 20€ Amazon vouchers

---

## Survey Structure

- **Universal Path:** ALL users answer ALL validation blocks
- **No Segmentation:** Everyone gets loneliness questions (the paradox of our time: many people are lonely even with friends)
- **Order:** Validation first (Blocks 0-7), Marketing last (Blocks 8-9), Demographics (Block 10)

---

## Block 0: Universal Screening (Privacy & Enshittification)

### Q1: Big Tech Data Concern

**Variable:** `privacy_concern_bigtech`

"How do you feel about Big Tech (Google, Meta) using your data?"

- [ ] Very concerning
- [ ] Somewhat concerning
- [ ] Don't care

### Q2: App Enshittification

**Variable:** `enshittification_frustration`

"Do you feel that big tech apps are getting worse over time (e.g., more ads, paywalls, annoying features)?"

- [ ] Yes
- [ ] Somewhat
- [ ] No

---

## Block 1: Civic Connect Validation (Priority Product)

**Decision Goal:** If <50% struggle with social coordination, we deprioritize Connect.

### Q3: Loneliness Frequency

**Variable:** `loneliness_freq`

"In the last month, how often did you feel lonely or wished you had more social contact?"

- [ ] Never
- [ ] Sometimes
- [ ] Often
- [ ] Constantly

### Q4: Activity Pain

**Variable:** `activity_pain`

"How often do you struggle to plan activities with friends?"

- [ ] Very often
- [ ] Sometimes
- [ ] Rarely
- [ ] Never

### Q4a: Coordination Pain

<!-- Only if Q4 = "Sometimes" or "Often" -->

**Variable:** `coordination_pain`

"What are the most common problems when coordinating activities with friends?"

- [ ] Messy group chats
- [ ] Unclear responses
- [ ] No initiation
- [ ] Fluking
- [ ] Other

### Q5: Activity Barrier - Main

**Variable:** `activity_barrier_main`

"Think of the last time you wanted to try a new activity (movie, game, sport, event). What stopped you from doing it?"

- [ ] No one to go with
- [ ] Don't know where/how
- [ ] Too expensive
- [ ] No time
- [ ] I did it

### Q7: Invitation Comfort

<!-- Only if Q5 = "No one to go with" -->

**Variable:** `invitation_comfort`

"How comfortable would you be to invite one or more other people that suffer from the same problem as you for this specific activity?"

- [ ] Very comfortable
- [ ] Somewhat comfortable
- [ ] Uncomfortable
- [ ] I would never do this

### Q8: Friends Availability

**Variable:** `friends_availability`

"Do you have people you'd want to invite to activities, or are you looking to meet new people?"

- [ ] I have people but coordination is hard
- [ ] I want to meet new people
- [ ] Both

### Q8a: Activity Coordination Method ("With Me" USP Validation)

**Variable:** `with_me_signal_preference`

**Decision Goal:** If <40% prefer "Signal to all", "With Me" is not a killer feature.

"When you want to do something but need company (e.g., going to the gym, watching a movie), which would you prefer?"

- [ ] Post a signal to all friends at once: "Going to gym at 6pm, who's in?"
- [ ] Text 3-5 friends individually to ask
- [ ] Just go alone

### Q8b: Feed Scope Preference (Hyper-Local USP Validation)

**Variable:** `feed_scope_preference`

**Decision Goal:** If <50% prefer "Local only", adjust feed algorithm strategy.

"For a social activity app, what content would you want to see?"

- [ ] Only activities within 5-10km of me
- [ ] Mix of local and city-wide
- [ ] Everything, including global events

---

## Block 2: Civic Love Validation (Priority Product)

**Decision Goal:** If <60% are frustrated with the dating market + trust issues, we deprioritize Love.

### Q9: Dating Market Frustration

**Variable:** `dating_market_frustration`

"How do you feel about the current dating market (apps, meeting people IRL, etc.)?"

- [ ] Very frustrated
- [ ] Somewhat frustrated
- [ ] It's fine

### Q10: Dating App Usage

**Variable:** `dating_app_usage`

"Have you used a dating app (Tinder, Bumble, etc.) in the last 12 months?"

- [ ] Yes, actively
- [ ] Yes, but quit
- [ ] Never used

### Q11: Paywall Frustration

**Variable:** `dating_frustration_paywall`

**Skip Logic:** Only show if Q10 ≠ "Never used"

"If you used dating apps, how much did paywalls/restricted features frustrate you?"

- [ ] Extremely
- [ ] Moderately
- [ ] A little
- [ ] Not at all
- [ ] N/A

### Q12: Trust in Dating Apps

**Variable:** `dating_trust_business`

"Do you trust dating apps to actually help you find a partner (vs. keeping you hooked)?"

- [ ] Yes
- [ ] Somewhat
- [ ] No

### Q13: Willingness to Switch

**Variable:** `dating_switch_willingness`

"Would you switch to a new dating app if it was non-profit, had fewer users initially, but promised more connection through a transparent algorithm and no paywalls (but all the features)?"

- [ ] Yes, immediately
- [ ] Yes, if friends use it
- [ ] No

---

## Block 3: Civic Quest Validation (Add-On Product)

**Decision Goal:** If <40% of NON-volunteers have intent + motivation, Quest stays as add-on only.

**Target:** People who DO NOT yet volunteer (not existing volunteers).

### Q14: Volunteering Frequency

**Variable:** `volunteer_past_12m`

"In the last 12 months, how many times did you volunteer or help in your community?"

- [ ] Never
- [ ] Sometimes
- [ ] Often
- [ ] Constantly

**Skip Logic:** If Q14 ≥ 6 → Skip to Block 4 (not target user)

### Q15: Information Barrier

**Variable:** `volunteer_barrier_info`

"Have you ever wanted to volunteer but didn't know where/how?"

- [ ] Yes
- [ ] No

### Q16: Friends Going Factor

**Variable:** `volunteer_barrier_friends`

"Would you be more likely to volunteer if your friends were also going?"

- [ ] Yes
- [ ] No
- [ ] I prefer going alone

### Q17: Recognition Importance

**Variable:** `volunteer_barrier_recognition`

"How important is it for you to get recognition (certificates, badges, CV proof, verified skills) for volunteering?"

- [ ] Very important
- [ ] Somewhat important
- [ ] Not important

### Q18: Motivation Ranking

**Variable:** `volunteer_motivation_rank`

"Rank these by importance (if you were to volunteer):"

**Drag & Drop (1 = most important, 4 = least important):**

- Friends going
- CV & verified skills
- Coupons/discounts
- Competition (city battles)

---

## Block 4: Civic Account Validation (Privacy Layer)

**Decision Goal:** Determine if 'Privacy First' or 'Convenience First' (OAuth with Google/Apple).

### Q19: Login Preference

**Variable:** `login_preference`

"When signing up for a new app, which login method do you prefer?"

- [ ] Social login (e.g., Google, Apple) for convenience
- [ ] Email and password for direct account control
- [ ] Privacy-focused options (e.g., anonymous, decentralized identity) / No Login at all

### Q20: Trust Score Comfort

**Variable:** `social_credit_concern`

"How would you feel about a 'Trust Level' based on your volunteering/activity (private by default, can be made visible)?"

- [ ] Sounds great
- [ ] Okay if private
- [ ] I don't like this

### Q21: Trust & Safety Pain

**Variable:** `trust_safety_pain`

"Have you ever avoided joining an online event, group, or dating app because you weren't sure if the people were real/trustworthy?"

- [ ] Yes, multiple times
- [ ] Yes, once or twice
- [ ] No

### Q22: Privacy Paradox

**Variable:** `privacy_paradox_verification`

"Would you be interested in a verification system that proves you're a real person (no bots/catfishing) without revealing your name/address?"

- [ ] Yes
- [ ] No
- [ ] I don't know

### Q23: Proof Without Exposure

**Variable:** `proof_without_exposure`

"Which of these would you find useful?" (Select all that apply)

- [ ] Prove I'm 18+ without showing my ID
- [ ] Prove I'm a student without revealing which university
- [ ] Prove I live in [City] without giving my exact address
- [ ] Prove I'm a verified volunteer/community member
- [ ] None of these

---

## Block 5: Network Effects Problem

**Goal:** Understand "Friends Dependency" and migration willingness.

### Q21: Friend Dependency

<!--  This doesnt solve the problem of an app being really good. I need to solve this for MY app. Maybe the solution is the measurement of interest in the app via email newsletter subsription... -->

**Variable:** `friend_dependency`

"Would you use a new app with cool features even if NONE of your friends currently use it?"

- [ ] Probably
- [ ] Maybe, if it's really good
- [ ] No

### Q22: Migration Trigger

**Variable:** `migration_trigger`

"What would convince you to consider using a new app for planning activities (compared to WhatsApp Group Chats for example)?" (Multiple answers possible)

- [ ] Better features
- [ ] Privacy-focused
- [ ] Friends use it
- [ ] Nothing, I like it how it is

### Q23: Early Adopter Incentive

**Variable:** `early_adopter_incentive`

"Would you invite friends to a new app if it got better features and you and your friends got exclusive benefits (badges, early features)?"

- [ ] Yes
- [ ] Maybe
- [ ] No

---

### Q25: Social Anxiety Reasons

<!-- Only present when Q24 is "Somewhat comfortable", "Uncomfortable", or "I would never" -->

**Variable:** `social_anxiety_reasons`

"If you feel uncomfortable joining new groups, what are the main reasons?" (Select all that apply)

- [ ] Not knowing anyone there
- [ ] Fear of not fitting in or being judged
- [ ] Uncertainty about what to do or say
- [ ] Feeling overwhelmed by new social situations
- [ ] Preferring to do activities alone or with close friends
- [ ] Lack of confidence in my social skills
- [ ] Other (please specify)

### Q25a: Buddy System Interest ("Lonely Mode" USP Validation)

**Variable:** `buddy_system_interest`

**Skip Logic:** Only show if Q_social_anxiety_level = "Uncomfortable" or "I would never"

**Decision Goal:** If ≥60% say "Yes", validates the Buddy System / Lonely Mode feature.

"Would you feel more comfortable joining a group event if you could be paired with an experienced 'buddy' who introduces you?"

- [ ] Yes, that would help a lot
- [ ] Maybe
- [ ] No, I'd rather go alone or not at all

## Block 7: Civic CV Credibility

**Goal:** Validate if employers care about Civic Quest XP and verified skills.

### Q26: Employer Value

**Variable:** `employer_value_civic_cv`

"If you were hiring, would a 'Civic CV' showing verified volunteering and verified skills (XP, badges) influence your decision?"

- [ ] Yes
- [ ] Maybe
- [ ] No

### Q27: Student CV Motivation

**Variable:** `student_cv_motivation`

"As a student/job seeker, would 'CV-boosting via verified skills and volunteering' motivate you to use the app more?"

- [ ] Yes
- [ ] Maybe
- [ ] No

---

## Block 8: Marketing Headlines (Biased Questions for PR)

**Goal:** Generate viral statistics like "80% agree loneliness is an epidemic".

### Q28: Loneliness Epidemic

**Variable:** `loneliness_epidemic`

"Do you agree that loneliness is a growing problem in our society?"

- [ ] Strongly agree
- [ ] Agree
- [ ] Neutral
- [ ] Disagree

### Q29: Big Tech Distrust

<!-- Maybe use the psychology methods here with strongly agree/disagree -->

**Variable:** `big_tech_distrust`

"Do you think Big Tech companies (Google, Meta, Microsoft) prioritize your wellbeing over their profits?"

- [ ] Yes
- [ ] No
- [ ] I dont know

### Q30: Dating App Predatory

**Variable:** `dating_app_predatory`

"Do you feel like dating apps are designed to keep you swiping rather than help you find a partner?"

- [ ] Yes, definitely
- [ ] No
- [ ] I dont know

### Q31: WhatsApp Chaos

**Variable:** `whatsapp_chaos`

"Have you ever missed an event or activity because of chaotic group chat planning?"

- [ ] Yes, multiple times
- [ ] Yes, once or twice
- [ ] No

### Q32: Volunteering CV Boost

**Variable:** `volunteering_cv_boost`

"Would you volunteer more if it counted towards your job applications?"

- [ ] Yes, much more
- [ ] Somewhat more
- [ ] No difference

---

## Block 9: Willingness to Pay (Price Sensitivity)

### Q33: Supporter Subscription

**Variable:** `supporter_subscription_wtp`

"How much would you be willing to pay per month to support a non-profit social app (without ads) that helps you connect with friends, date better, and volunteer?"

- [ ] 0€ (I won't pay)
- [ ] I would watch Ads in a non-obtrusive way
- [ ] 1-2€
- [ ] 3-5€
- [ ] 6-10€
- [ ] 10€+

### Q33a: Core Value Proposition Test (Multi-App Model)

**Variable:** `core_value_validated`

**Decision Goal:** If >50% say "None of these" → Value proposition does not resonate. If <20% say "Yes, immediately" in Q33b → No early adopter market.

"We're building a family of apps – use only what you need:

**📱 Civic Connect – The Activity Signal**

- Post 'Going to gym at 6pm – who's in?' and the invited friends (or people of a specific friend group) join/decline with one tap
- No more endless WhatsApp coordination chaos
- Only see what's happening near you – hyper-local, no global noise, focus on friends activities
- Built-in encrypted chat that auto-archives after the activity (no dead groups!)
- 'Buddy System': Get paired with someone who also doesnt know who to do <Specific Activity> with

- **💫 Civic Spark – Dating with Depth**

- 100% verified humans only (ID check required) – zero bots, zero catfish
- Matching based on shared values and interests, not just 'both like pizza'
- Optional Depth Mode: Faces are blurred – you match on personality first, looks reveal over time

**🎮 Civic Quest – Level Up by Helping**

- Join real-world 'quests' (park cleanups, senior visits) together with friends
- Earn XP, unlock badges, build a 'Civic CV' for job applications
- Get Perks for helping like discounts, free entry to events, etc.
- Flexible: Help 15 min or 2 hours – every minute counts

**🔐 Civic ID – Your Digital Trust Badge**

- One verified account across all Civic apps
- Prove you're 18+ or a student WITHOUT revealing your ID/address
- Log in everywhere with your Civic ID (like Google / Apple but without selling your data)
- Your data stays yours – no selling, no ads, ever

All non-profit. All open-source. All free.

Which would you use?" (Select all that apply)

- [ ] Civic Connect (Activities/Social)
- [ ] Civic Spark (Dating)
- [ ] Civic Quest (Volunteering)
- [ ] Civic ID (Verified Account)
- [ ] None of these

### Q33b: Immediate Interest

**Variable:** `immediate_interest`

**Skip Logic:** Only show if Q33a ≠ "None of these"

"How interested are you in trying this?"

- [ ] Yes, I'd use it immediately when it launches
- [ ] Yes, if my friends use it too
- [ ] Maybe, I'd try it
- [ ] Not really interested

---

## Block 10: Demographics

### Q34: Age Group

**Variable:** `age_group`

"Age"

- [ ] 16-20
- [ ] 21-25
- [ ] 26-30
- [ ] 31-40
- [ ] 40+

### Q35: Student Status

**Variable:** `student_status`

"Are you currently a student?"

- [ ] Yes
- [ ] No

### Q36: City Name

**Variable:** `city_name`

"What city do you live in?"

**[Open text field]**

> **Note:** Critical for strategic go-live planning

### Q37: Source

**Variable:** `source`

**[Hidden field]** - Automatically captured based on distribution channel:

- campus_flyer
- instagram
- discord
- email
- other

### Q37a: Waiting List Signup (Skin in the Game)

**Variable:** `waitlist_interest`

**Decision Goal:** Conversion Rate = Ultimate validation. If <5% leave email → No real interest. If >15% → Strong signal.

"Would you like to be notified when we launch? (Optional)"

- [ ] Yes, sign me up!
- [ ] Maybe later
- [ ] No thanks

### Q37b: Email Collection

**Variable:** `email_signup`

**Skip Logic:** Only show if Q37a = "Yes, sign me up!"

"Enter your email to join the waiting list:"

**[Email field - Optional]**

> **Note:** This is the ultimate "Skin in the Game" metric. Measures real commitment.

---

## 🚨 Project-Level Kill Threshold (Build or Kill Decision)

**This is the most important section of the survey analysis.**

### Go / No-Go Decision Matrix

| Scenario                 | Metrics                                                                  | Decision                                    |
| ------------------------ | ------------------------------------------------------------------------ | ------------------------------------------- |
| **🟢 GREEN (Build It)**  | ≥1 Product over threshold + ≥15% Email Signup + ≥20% "Use immediately"   | ✅ **FULL SPEED AHEAD**                     |
| **🟡 YELLOW (Cautious)** | ≥1 Product over threshold + 5-15% Email Signup                           | ⚠️ **Build smaller MVP** – validate further |
| **🔴 RED (Kill/Pivot)**  | ALL Products under threshold OR <5% Email Signup OR >50% "None of these" | ❌ **STOP** – Major pivot or kill project   |

### Kill Signals (Any ONE of these = RED)

| Signal                  | Threshold                                 | Meaning                                            |
| ----------------------- | ----------------------------------------- | -------------------------------------------------- |
| **No Product Interest** | >50% select "None of these" in Q33a       | Value proposition fundamentally broken             |
| **No Early Adopters**   | <20% say "Use immediately" in Q33b        | No one willing to be first                         |
| **No Real Commitment**  | <5% leave email in Q37b                   | Talk is cheap – no skin in the game                |
| **All Pain Points Low** | Connect <50% AND Love <60% AND Quest <40% | Target audience doesn't have the problems we solve |
| **Privacy Irrelevant**  | <30% "Very concerned" about Big Tech      | Our differentiation doesn't matter to users        |

### Aggregated Score Calculation

```
Project Viability Score =
  (Connect_Pain × 0.25) +
  (Love_Pain × 0.25) +
  (Quest_Intent × 0.15) +
  (Immediate_Interest × 0.20) +
  (Email_Conversion × 0.15)

If Score < 40% → RED (Kill)
If Score 40-60% → YELLOW (Pivot/Reduce Scope)
If Score > 60% → GREEN (Build)
```

---

## Success Criteria (Decision Thresholds)

### Product Launch Priority

| Product           | Validation Threshold                              | Launch Decision                              |
| ----------------- | ------------------------------------------------- | -------------------------------------------- |
| **Civic Connect** | ≥50% struggle with coordination + loneliness      | **Build First** if highest score             |
| **Civic Love**    | ≥60% frustrated with dating market + trust issues | **Build First** if highest score             |
| **Civic Quest**   | ≥40% of non-volunteers have intent + motivation   | **Add-On** (not standalone founding product) |

### Feature Decisions

| Feature                | Threshold                                | Decision                                                    |
| ---------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| **Privacy (Account)**  | ≥50% are "Very concerned" about Big Tech | Prioritize **Privacy First** over OAuth                     |
| **Network Effects**    | ≥70% say "I need friends on the app"     | Prioritize **Love or Quest as friend-maker** before Connect |
| **Loneliness Paradox** | ≥60% prefer "joining" over "creating"    | Confirm **Quest → Connect** sequence                        |
| **Civic CV**           | <30% of employers value it               | **Remove CV angle from marketing**                          |
| **"With Me" Signals**  | ≥40% prefer "Signal to all friends"      | **Core USP validated** – prioritize in MVP                  |
| **Hyper-Local Feed**   | ≥50% prefer "Local only" content         | **Confirm 2-10km radius strategy**                          |
| **Buddy System**       | ≥60% of anxious users want buddy pairing | **Validate Lonely Mode feature**                            |

---

## Distribution Strategy

1. **Campus Flyers** - QR codes at universities: Münster, Tübingen, Berlin
2. **Discord Communities** - Gaming, Volunteering, Student groups
3. **Instagram Ads** - Target: 18-25, interests: social connection, dating, volunteering
4. **Incentive** - Enter raffle for 10x 20€ Amazon vouchers

**Target:** 300-500 responses (accounting for 40% drop-off)  
**Required Survey Starts:** ~1000 to get 300 core users

---

## Implementation Notes

**Platform Recommendations:**

- **Google Forms** - Free, easy logic, good for pilot
- **Typeform** - Best UX, drag & drop support, higher completion rates
- **LimeSurvey** - Open source, full control, complex logic support

**Skip Logic Summary:**

- Q11 (Paywall frustration): Only if Q10 ≠ "Never used"
- Block 3 (Quest): Skip if Q14 ≥ 6 (existing volunteers not target)

**Data Export:**
All variables listed above for easy analysis and cross-tabulation.
