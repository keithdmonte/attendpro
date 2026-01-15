"""change subject code unique to code class composite

Revision ID: a4b28bcbce11
Revises: 5cdfc527d9ea
Create Date: 2025-12-06 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a4b28bcbce11'
down_revision: Union[str, None] = '5cdfc527d9ea'
branch_labels: Union[str, None] = None
depends_on: Union[str, None] = None


def upgrade() -> None:
    # Drop the old unique constraint on code only
    op.drop_index('ix_subjects_code', table_name='subjects')
    
    # Create a non-unique index on code
    op.create_index('ix_subjects_code', 'subjects', ['code'], unique=False)
    
    # Create composite unique constraint on (code, class_name)
    op.create_unique_constraint('uq_subject_code_class', 'subjects', ['code', 'class_name'])


def downgrade() -> None:
    # Drop composite unique constraint
    op.drop_constraint('uq_subject_code_class', 'subjects', type_='unique')
    
    # Drop non-unique index
    op.drop_index('ix_subjects_code', table_name='subjects')
    
    # Recreate unique index on code only
    op.create_index('ix_subjects_code', 'subjects', ['code'], unique=True)
