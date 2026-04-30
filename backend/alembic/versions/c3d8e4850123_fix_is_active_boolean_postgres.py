"""fix surveys is_active type for postgres

Revision ID: c3d8e4850123
Revises: b2cd8e485012
Create Date: 2026-04-30 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3d8e4850123'
down_revision = 'b2cd8e485012'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use context to determine dialect
    bind = op.get_bind()
    dialect = bind.dialect.name

    if dialect == 'postgresql':
        # PostgreSQL specific conversion with USING
        op.execute(
            "ALTER TABLE surveys ALTER COLUMN is_active TYPE BOOLEAN USING (CASE WHEN is_active = 'true' THEN TRUE ELSE FALSE END)")
    else:
        # Default behavior for other dialects like SQLite
        with op.batch_alter_table('surveys', schema=None) as batch_op:
            batch_op.alter_column('is_active',
                                  existing_type=sa.String(length=5),
                                  type_=sa.Boolean(),
                                  postgresql_using='is_active::boolean',
                                  existing_nullable=True)


def downgrade() -> None:
    bind = op.get_bind()
    dialect = bind.dialect.name

    if dialect == 'postgresql':
        op.execute(
            "ALTER TABLE surveys ALTER COLUMN is_active TYPE VARCHAR(5) USING (CASE WHEN is_active THEN 'true' ELSE 'false' END)")
    else:
        with op.batch_alter_table('surveys', schema=None) as batch_op:
            batch_op.alter_column('is_active',
                                  existing_type=sa.Boolean(),
                                  type_=sa.String(length=5),
                                  existing_nullable=True)
