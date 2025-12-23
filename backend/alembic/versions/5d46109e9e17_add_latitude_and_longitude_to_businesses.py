"""Add latitude and longitude to businesses

Revision ID: 5d46109e9e17
Revises: da374ccad9e5
Create Date: 2025-12-22 20:21:17.826985

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5d46109e9e17'
down_revision: Union[str, None] = 'da374ccad9e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add latitude and longitude columns to businesses table
    op.add_column('businesses', sa.Column('latitude', sa.Float(), nullable=True))
    op.add_column('businesses', sa.Column('longitude', sa.Float(), nullable=True))


def downgrade() -> None:
    # Remove latitude and longitude columns from businesses table
    op.drop_column('businesses', 'longitude')
    op.drop_column('businesses', 'latitude')
