#!/usr/bin/env python3
"""
TalentSol ATS - Synthetic Data Generator for Dashboard Metrics
Generates synthetic data to fix "Time to Hire" and "Interviews This Week" metrics
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random
import uuid

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'talentsol_user',
    'password': 'talentsol_password',
    'database': 'talentsol_ats'
}

class SyntheticDataGenerator:
    def __init__(self):
        self.connection = None

    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            self.connection = psycopg2.connect(**DB_CONFIG)
            self.connection.autocommit = True
            print("✅ Connected to TalentSol database")
        except Exception as e:
            print(f"❌ Failed to connect to database: {e}")
            sys.exit(1)

    def disconnect(self):
        """Disconnect from database"""
        if self.connection:
            self.connection.close()
            print("🔌 Disconnected from database")

    def get_existing_data(self) -> Dict[str, List[Any]]:
        """Get existing applications and users for reference"""
        print("🔍 Fetching existing data...")

        cursor = self.connection.cursor(cursor_factory=RealDictCursor)

        # Get existing applications
        cursor.execute("""
            SELECT id, candidate_id, job_id, status, submitted_at
            FROM applications
            ORDER BY submitted_at DESC
            LIMIT 20
        """)
        applications = cursor.fetchall()

        # Get existing users (for created_by_id)
        cursor.execute("SELECT id FROM users LIMIT 5")
        users = cursor.fetchall()

        cursor.close()

        print(f"📊 Found {len(applications)} applications and {len(users)} users")

        return {
            'applications': applications,
            'users': users
        }
    
    def create_hired_applications(self, applications: List[Any]) -> int:
        """Update some applications to 'hired' status with hiredAt dates"""
        print("🎯 Creating hired applications for Time to Hire metric...")

        if not applications:
            print("⚠️  No applications found to update")
            return 0

        cursor = self.connection.cursor()

        # Select first 5 applications to mark as hired
        hired_count = 0
        for i, app in enumerate(applications[:5]):
            # Calculate hired date (15-45 days after submission)
            submitted_at = app['submitted_at']
            days_to_hire = random.randint(15, 45)
            hired_at = submitted_at + timedelta(days=days_to_hire)

            # Update application status and hired_at
            cursor.execute("""
                UPDATE applications
                SET status = 'hired', hired_at = %s
                WHERE id = %s
            """, (hired_at, app['id']))

            hired_count += 1
            print(f"  ✅ Updated application {app['id']} - hired after {days_to_hire} days")

        cursor.close()
        return hired_count
    
    def create_upcoming_interviews(self, applications: List[Any], users: List[Any]) -> int:
        """Create upcoming interviews for the next 7 days"""
        print("📅 Creating upcoming interviews for Interviews This Week metric...")

        if not applications or not users:
            print("⚠️  Insufficient data to create interviews")
            return 0

        cursor = self.connection.cursor()

        # Interview types and locations
        interview_types = ['technical', 'behavioral', 'panel', 'cultural_fit', 'final']
        locations = ['Video Call - Zoom', 'Office Conference Room A', 'Office Conference Room B', 'Video Call - Teams']

        created_count = 0
        now = datetime.now()

        # Create 8 interviews over the next 7 days
        for i in range(8):
            app = applications[i % len(applications)]
            user = users[i % len(users)]

            # Generate interview date within next 7 days
            days_ahead = random.randint(0, 6)
            hours_ahead = random.randint(9, 17)  # 9 AM to 5 PM
            minutes = random.choice([0, 30])  # On the hour or half hour

            scheduled_date = now + timedelta(days=days_ahead, hours=hours_ahead-now.hour, minutes=minutes-now.minute, seconds=-now.second, microseconds=-now.microsecond)

            # Generate interview data
            interview_id = f"int_{uuid.uuid4().hex[:8]}"
            interview_type = random.choice(interview_types)
            location = random.choice(locations)
            duration = random.choice([45, 60, 90])  # minutes

            # Insert interview
            cursor.execute("""
                INSERT INTO interviews (
                    id, application_id, type, scheduled_date, duration,
                    location, status, notes, created_by_id, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                interview_id,
                app['id'],
                interview_type,
                scheduled_date,
                duration,
                location,
                'scheduled',
                f"{interview_type.title()} interview with candidate",
                user['id'],
                now,
                now
            ))

            created_count += 1
            print(f"  ✅ Created {interview_type} interview on {scheduled_date.strftime('%Y-%m-%d %H:%M')}")

        cursor.close()
        return created_count
    
    def update_application_statuses(self, applications: List[Any]) -> int:
        """Update some applications to 'interview' status for consistency"""
        print("🔄 Updating application statuses...")

        cursor = self.connection.cursor()

        updated_count = 0
        # Update applications 6-10 to 'interview' status
        for app in applications[5:10]:
            cursor.execute("""
                UPDATE applications
                SET status = 'interview'
                WHERE id = %s
            """, (app['id'],))

            updated_count += 1
            print(f"  ✅ Updated application {app['id']} to 'interview' status")

        cursor.close()
        return updated_count

    def verify_data(self):
        """Verify the created data"""
        print("🔍 Verifying created data...")

        cursor = self.connection.cursor()

        # Check hired applications
        cursor.execute("""
            SELECT COUNT(*) FROM applications
            WHERE status = 'hired' AND hired_at IS NOT NULL
        """)
        hired_count = cursor.fetchone()[0]

        # Check upcoming interviews
        now = datetime.now()
        next_week = now + timedelta(days=7)
        cursor.execute("""
            SELECT COUNT(*) FROM interviews
            WHERE scheduled_date BETWEEN %s AND %s AND status = 'scheduled'
        """, (now, next_week))
        upcoming_interviews = cursor.fetchone()[0]

        cursor.close()

        print(f"📊 Verification Results:")
        print(f"  - Hired applications: {hired_count}")
        print(f"  - Upcoming interviews (next 7 days): {upcoming_interviews}")

        return hired_count > 0 and upcoming_interviews > 0

def main():
    """Main execution function"""
    print("🚀 TalentSol ATS - Synthetic Data Generator")
    print("=" * 50)

    generator = SyntheticDataGenerator()

    try:
        # Connect to database
        generator.connect()

        # Get existing data
        existing_data = generator.get_existing_data()

        # Create synthetic data
        hired_count = generator.create_hired_applications(existing_data['applications'])
        interview_count = generator.create_upcoming_interviews(
            existing_data['applications'],
            existing_data['users']
        )
        status_count = generator.update_application_statuses(existing_data['applications'])

        # Verify data
        verification_passed = generator.verify_data()

        print("\n" + "=" * 50)
        print("📈 Summary:")
        print(f"  - Created {hired_count} hired applications")
        print(f"  - Created {interview_count} upcoming interviews")
        print(f"  - Updated {status_count} application statuses")
        print(f"  - Verification: {'✅ PASSED' if verification_passed else '❌ FAILED'}")

        if verification_passed:
            print("\n🎉 Synthetic data generation completed successfully!")
            print("💡 You can now check the Dashboard - both metrics should show data")
        else:
            print("\n⚠️  Data verification failed - please check the database")

    except Exception as e:
        print(f"❌ Error during data generation: {e}")
        sys.exit(1)

    finally:
        generator.disconnect()

if __name__ == "__main__":
    # Check if psycopg2 is installed
    try:
        import psycopg2
    except ImportError:
        print("❌ psycopg2 library not found")
        print("💡 Install it with: pip install psycopg2-binary")
        sys.exit(1)

    # Run the generator
    main()
