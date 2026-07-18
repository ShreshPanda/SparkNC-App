# SparkNC Leadership Demo Script

## Setup (5 minutes before)
1. Open the Expo app or web preview and log in with the demo student account.
2. In a separate window, log in to the demo admin account on the web dashboard.
3. Ensure `wrangler dev` is running or the production Worker URL is configured.
4. Clear browser cache / local data to avoid stale demo artifacts.

## Intro (2 minutes)
- SparkNC turns student growth into a structured, supportive journey.
- It gives students clarity, ambassadors actionable insight, and administrators trustworthy program data.
- Every feature is built on privacy-first design: only the right people see the right data.

## Act 1 — Student Growth (3 minutes)
1. **Dashboard**
   - Show the welcome card, streak, XP, and next task.
   - Point out that every action feeds a personal growth timeline, not a leaderboard.
2. **Tasks & Goals**
   - Complete one demo task. Watch XP, streak, and a goal update in real time.
   - Open the Growth Timeline to show a week-by-week story of progress.
3. **AI Companion**
   - Tap "Reflect on this week".
   - Show the AI response is private, positive, and offers one concrete next step.

## Act 2 — Ambassador Support (3 minutes)
1. **Command Center**
   - Switch to the demo ambassador account.
   - Show the student list bucketed by engagement.
2. **At-Risk Student**
   - Tap a student marked "needs attention".
   - Show recommended actions and send a short support message.
3. **Close the loop**
   - Return to the student view; show the message appears in notifications.

## Act 3 — Admin & Organization (4 minutes)
1. **Admin Overview**
   - Switch to the admin dashboard.
   - Show the organization metrics, XP trend, and active-student counts.
2. **Student Support**
   - Open the support view and identify the at-risk group.
   - Click a student to see summary progress, not private details.
3. **Program Analytics**
   - Show event attendance, feedback themes, and improvement recommendations.
4. **Audit & Security**
   - Open `/audit` and show a recent sensitive action was logged with no private data.
   - Explain that every admin and ambassador action is traceable.

## Act 4 — Community & Scale (3 minutes)
1. **Community Groups**
   - Create a new "Career Readiness" group as a student.
   - Join the group and post a milestone update.
2. **Notifications**
   - Show a personalized push/streak reminder and quiet-hours configuration.
3. **Offline Demo**
   - Simulate going offline, create a task, then reconnect and sync.
   - Show the pending-count badge dropping to zero as the queue clears.

## Closing (1 minute)
- SparkNC is not just a task list. It is an ecosystem: student growth, peer support, organizational insight, and responsible AI — all in one platform.
- The next step is production deployment and expanding Vitest coverage, then a phased rollout to one school.

## Fallback notes
- If an AI response is slow, use the prepared demo response from `/demo`.
- If a push notification does not arrive, show the `notification_preferences` screen and explain provider setup.
- If offline sync is not enabled, mock the flow with queued local storage updates.
