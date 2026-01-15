"""add class lecture_type time fields

Revision ID: add_class_fields
Revises: efd0cf22aebc
Create Date: 2025-01-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_class_fields'
down_revision: Union[str, None] = 'efd0cf22aebc'
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    # Add class_name to students table
    op.add_column('students', sa.Column('class_name', sa.String(length=50), nullable=True))
    op.create_index(op.f('ix_students_class_name'), 'students', ['class_name'], unique=False)
    
    # Add time and lecture_type to attendance table
    op.add_column('attendance', sa.Column('time', sa.Time(), nullable=True))
    op.add_column('attendance', sa.Column('lecture_type', sa.String(length=20), nullable=True))
    
    # Drop old unique constraint and create new one with lecture_type
    op.drop_constraint('uq_attendance_unique_mark', 'attendance', type_='unique')
    op.create_unique_constraint(
        'uq_attendance_unique_mark',
        'attendance',
        ['student_id', 'subject_id', 'attendance_date', 'lecture_type']
    )


def downgrade() -> None:
    # Revert unique constraint
    op.drop_constraint('uq_attendance_unique_mark', 'attendance', type_='unique')
    op.create_unique_constraint(
        'uq_attendance_unique_mark',
        'attendance',
        ['student_id', 'subject_id', 'attendance_date']
    )
    
    # Remove columns
    op.drop_column('attendance', 'lecture_type')
    op.drop_column('attendance', 'time')
    op.drop_index(op.f('ix_students_class_name'), table_name='students')
    op.drop_column('students', 'class_name')

