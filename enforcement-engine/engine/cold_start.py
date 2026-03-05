#!/usr/bin/env python3
"""
cold_start.py — Cold Start Script for the Jeeves Enforcement Engine

This script initializes the Jeeves Enforcement Engine for a new session.
It is the FIRST thing that runs at the start of every session.

Usage:
    python -m engine.cold_start
    python -m engine.cold_start --repo-path /path/to/repo
    python -m engine.cold_start --verbose
    python -m engine.cold_start --audit  # Also run weekly audit

What it does:
    1. Initializes the JeevesEngine with the repo path
    2. Runs cold_start() which:
        - Starts a new session
        - Loads all constitutional files
        - Runs session start drift check
        - Verifies all files are present and in sync
    3. Prints a status report
    4. Optionally runs a weekly audit
"""

import argparse
import json
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.jeeves_engine import JeevesEngine


def main():
    parser = argparse.ArgumentParser(
        description="Cold Start the Jeeves Enforcement Engine"
    )
    parser.add_argument(
        "--repo-path",
        default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        help="Path to the master-jeeves-brain repository",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print verbose output",
    )
    parser.add_argument(
        "--audit",
        action="store_true",
        help="Also run a weekly audit after cold start",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output in JSON format",
    )
    args = parser.parse_args()

    # Initialize engine
    print("=" * 60)
    print("  JEEVES ENFORCEMENT ENGINE — COLD START")
    print("=" * 60)
    print()

    try:
        engine = JeevesEngine(args.repo_path)
        result = engine.cold_start({"source": "cold_start.py"})

        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print(f"  Status:              {result['status']}")
            print(f"  Session ID:          {result['session_id']}")
            print(f"  Constitution:        {result['constitution_articles']} articles")
            print(f"  Directives Loaded:   {result['directives_loaded']}")
            print(f"  Decisions Loaded:    {result['decisions_loaded']}")
            print(f"  Vocabulary Terms:    {result['vocabulary_terms']}")
            print(f"  Drift Events:        {result['drift_events']}")
            print(f"  Critical Events:     {result['critical_events']}")
            print()
            print(f"  North Star: {result['north_star'][:80]}...")
            print()

            if result['critical_events'] > 0:
                print("  ⚠️  CRITICAL DRIFT EVENTS DETECTED")
                print("  Review drift events before proceeding.")
            else:
                print("  ✅ All systems nominal. Ready to operate.")

        if args.verbose:
            print()
            print("  Full System Status:")
            print("  " + "-" * 56)
            status = engine.get_system_status()
            print(json.dumps(status, indent=2, default=str))

        if args.audit:
            print()
            print("  Running Weekly Audit...")
            print("  " + "-" * 56)
            report = engine.run_weekly_audit()
            if args.json:
                print(json.dumps({
                    "compliance_score": report.compliance_score,
                    "score_breakdown": report.score_breakdown,
                    "recommendations": report.recommendations,
                }, indent=2))
            else:
                print(report.to_markdown())

        # Shutdown
        engine.shutdown()

    except FileNotFoundError as e:
        print(f"  ERROR: {e}")
        print("  Make sure you're running from the master-jeeves-brain directory.")
        sys.exit(1)
    except Exception as e:
        print(f"  ERROR: {e}")
        sys.exit(1)

    print()
    print("=" * 60)
    print("  COLD START COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
