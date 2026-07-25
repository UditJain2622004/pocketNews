"""In-process hackathon scheduler for published episode workflows."""
from __future__ import annotations

from zoneinfo import ZoneInfo

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from automated_workflows import run_daily_workflow, run_monthly_workflow, run_weekly_workflow


TIMEZONE = ZoneInfo("Asia/Kolkata")
_scheduler: BackgroundScheduler | None = None


def start_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        return
    _scheduler = BackgroundScheduler(timezone=TIMEZONE)
    _scheduler.add_job(run_daily_workflow, CronTrigger(hour=0, minute=0, timezone=TIMEZONE), id="daily-workflow", replace_existing=True, coalesce=True)
    _scheduler.add_job(run_weekly_workflow, CronTrigger(day_of_week="mon", hour=0, minute=15, timezone=TIMEZONE), id="weekly-workflow", replace_existing=True, coalesce=True)
    _scheduler.add_job(run_monthly_workflow, CronTrigger(day=1, hour=0, minute=30, timezone=TIMEZONE), id="monthly-workflow", replace_existing=True, coalesce=True)
    _scheduler.start()


def stop_scheduler() -> None:
    if _scheduler and _scheduler.running:
        _scheduler.shutdown(wait=False)
