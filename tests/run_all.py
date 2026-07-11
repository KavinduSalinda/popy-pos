#!/usr/bin/env python3
"""Run the full Popy POS test suite and print a clear summary."""

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
BACKEND_DIR = REPO / "popy-be"
FRONTEND_DIR = REPO / "popy-fe"
REPORTS_DIR = ROOT / "reports"


@dataclass
class SuiteResult:
    name: str
    command: str
    exit_code: int
    duration_sec: float
    status: str


def find_python() -> str:
    candidates = [
        BACKEND_DIR / "venv" / "Scripts" / "python.exe",
        BACKEND_DIR / "venv" / "bin" / "python",
        BACKEND_DIR / ".venv" / "Scripts" / "python.exe",
        BACKEND_DIR / ".venv" / "bin" / "python",
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return sys.executable


def run_step(name: str, command: list[str], cwd: Path) -> SuiteResult:
    print("\n" + "=" * 72)
    print(name)
    print("=" * 72)
    print("Command:", " ".join(command))
    print()

    started = time.time()
    completed = subprocess.run(command, cwd=str(cwd))
    duration = round(time.time() - started, 2)
    status = "PASS" if completed.returncode == 0 else "FAIL"

    print(f"\n>>> {name}: {status} ({duration}s)")

    return SuiteResult(
        name=name,
        command=" ".join(command),
        exit_code=completed.returncode,
        duration_sec=duration,
        status=status,
    )


def print_summary(results: list[SuiteResult]) -> int:
    passed = sum(1 for result in results if result.status == "PASS")
    failed = len(results) - passed

    print("\n" + "#" * 72)
    print("POPY POS TEST SUMMARY")
    print("#" * 72)
    for result in results:
        icon = "OK" if result.status == "PASS" else "XX"
        print(f"[{icon}] {result.name:<28} {result.status:<6} {result.duration_sec:>6}s")
    print("-" * 72)
    print(f"Total suites: {len(results)} | Passed: {passed} | Failed: {failed}")
    print("#" * 72)

    return 0 if failed == 0 else 1


def write_report(results: list[SuiteResult]) -> None:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "results": [asdict(result) for result in results],
        "passed": sum(1 for result in results if result.status == "PASS"),
        "failed": sum(1 for result in results if result.status == "FAIL"),
    }
    report_path = REPORTS_DIR / f"test-report-{stamp}.json"
    latest_path = REPORTS_DIR / "latest.json"
    report_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    latest_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"\nReport saved to: {report_path}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run full Popy POS test suite")
    parser.add_argument("--backend-only", action="store_true")
    parser.add_argument("--frontend-only", action="store_true")
    parser.add_argument("--with-smoke", action="store_true", help="Include live API smoke tests")
    parser.add_argument("--install-deps", action="store_true", help="Install tests/requirements.txt")
    args = parser.parse_args()

    python_exe = find_python()
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    results: list[SuiteResult] = []

    if args.install_deps:
        results.append(
            run_step(
                "Install test dependencies",
                [python_exe, "-m", "pip", "install", "-r", str(ROOT / "requirements.txt")],
                ROOT,
            )
        )

    run_backend = not args.frontend_only
    run_frontend = not args.backend_only

    if run_backend:
        pytest_args = [python_exe, "-m", "pytest", "backend"]
        if not args.with_smoke:
            pytest_args.extend(["-m", "not smoke"])
        results.append(run_step("Backend API tests", pytest_args, ROOT))

    if run_frontend:
        results.append(
            run_step("Frontend unit tests", [npm_cmd, "run", "test"], FRONTEND_DIR)
        )
        results.append(
            run_step(
                "Frontend typecheck",
                [npm_cmd, "run", "typecheck"],
                FRONTEND_DIR,
            )
        )

    if args.with_smoke and run_backend:
        results.append(
            run_step(
                "Live API smoke tests",
                [python_exe, "-m", "pytest", "backend/test_10_smoke_live.py", "-m", "smoke"],
                ROOT,
            )
        )

    write_report(results)
    return print_summary(results)


if __name__ == "__main__":
    raise SystemExit(main())
