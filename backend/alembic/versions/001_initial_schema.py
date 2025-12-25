"""Initial schema baseline

Revision ID: 001_initial
Revises: 
Create Date: 2025-12-25
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table('users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=True),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('is_admin', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime()),
        sa.Column('oauth_provider', sa.String(20), default='local'),
        sa.Column('oauth_id', sa.String(255), nullable=True),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('email_verified', sa.Boolean(), default=False),
        sa.Column('last_login', sa.DateTime(), nullable=True),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_oauth_id', 'users', ['oauth_id'], unique=False)

    # Surveys table
    op.create_table('surveys',
        sa.Column('id', sa.String(100), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('definition', sa.JSON(), nullable=False),
        sa.Column('is_active', sa.String(5), default='true'),
        sa.Column('created_at', sa.DateTime()),
        sa.Column('updated_at', sa.DateTime()),
    )

    # Responses table
    op.create_table('responses',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('survey_id', sa.String(100), nullable=False),
        sa.Column('variant_id', sa.String(50), nullable=True),
        sa.Column('answers', sa.JSON(), nullable=False),
        sa.Column('meta', sa.JSON()),
        sa.Column('fingerprint_hash', sa.String(64), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime()),
    )
    op.create_index('ix_responses_survey_id', 'responses', ['survey_id'], unique=False)
    op.create_index('ix_responses_variant_id', 'responses', ['variant_id'], unique=False)
    op.create_index('ix_responses_fingerprint_hash', 'responses', ['fingerprint_hash'], unique=False)
    op.create_index('ix_responses_created_at', 'responses', ['created_at'], unique=False)

    # Participations table
    op.create_table('participations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('survey_id', sa.String(100), nullable=False),
        sa.Column('fingerprint_hash', sa.String(64), nullable=False),
        sa.Column('created_at', sa.DateTime()),
    )
    op.create_index('ix_participations_survey_id', 'participations', ['survey_id'], unique=False)
    op.create_index('ix_participations_fingerprint_hash', 'participations', ['fingerprint_hash'], unique=False)

    # Survey events table
    op.create_table('survey_events',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('survey_id', sa.String(100), nullable=False),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('question_id', sa.String(100), nullable=True),
        sa.Column('session_id', sa.String(36), nullable=True),
        sa.Column('meta', sa.JSON()),
        sa.Column('created_at', sa.DateTime()),
    )
    op.create_index('ix_survey_events_survey_id', 'survey_events', ['survey_id'], unique=False)
    op.create_index('ix_survey_events_created_at', 'survey_events', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_table('survey_events')
    op.drop_table('participations')
    op.drop_table('responses')
    op.drop_table('surveys')
    op.drop_table('users')
