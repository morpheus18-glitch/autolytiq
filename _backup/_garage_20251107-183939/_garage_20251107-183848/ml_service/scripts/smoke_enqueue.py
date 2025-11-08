from __future__ import annotations

import json
import sys
import time

from config.env import ENV  # noqa: F401 - ensure environment validation runs
from workers.celery_app import celery_app


def main() -> int:
    task_name = sys.argv[1] if len(sys.argv) > 1 else 'workers.tasks.smoke_check'
    job = celery_app.send_task(task_name)
    print(f"Queued {task_name} with id={job.id}")

    deadline = time.time() + 30
    while time.time() < deadline:
        result = job.result
        if result is not None:
            print("Task completed:", json.dumps(result, indent=2))
            return 0
        if job.ready():
            data = job.get(timeout=1)
            print("Task completed:", json.dumps(data, indent=2))
            return 0
        time.sleep(0.5)

    print("Timed out waiting for smoke_check result", file=sys.stderr)
    return 1


if __name__ == '__main__':
    sys.exit(main())
