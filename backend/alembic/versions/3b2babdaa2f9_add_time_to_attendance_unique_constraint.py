"""add time to attendance unique constraint

Revision ID: 3b2babdaa2f9
Revises: a4b28bcbce11
Create Date: 2025-12-06 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3b2babdaa2f9'
down_revision: Union[str, None] = 'a4b28bcbce11'
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    # Drop the existing unique constraint
    op.drop_constraint('uq_attendance_unique_mark', 'attendance', type_='unique')
    
    # Create new unique constraint that includes time
    # This allows multiple lectures of the same type on the same day if they have different times
    op.create_unique_constraint(
        'uq_attendance_unique_mark',
        'attendance',
        ['student_id', 'subject_id', 'attendance_date', 'lecture_type', 'time']
    )


def downgrade() -> None:
    # Drop the constraint with time
    op.drop_constraint('uq_attendance_unique_mark', 'attendance', type_='unique')
    
    # Recreate the constraint without time
    op.create_unique_constraint(
        'uq_attendance_unique_mark',
        'attendance',
        ['student_id', 'subject_id', 'attendance_date', 'lecture_type']
    )
