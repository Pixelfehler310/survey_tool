"""
Analytics endpoints for advanced survey insights
"""

import csv
import io
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.response import Response
from .auth import require_admin, TokenData

router = APIRouter(tags=["analytics"])


@router.get("/analytics/funnel/{survey_id}")
async def get_funnel_data(
    survey_id: str,
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    Get funnel analysis showing drop-off per question.
    
    Returns completion rate for each question in the survey.
    """
    # Get all responses for this survey
    result = await db.execute(
        select(Response).where(Response.survey_id == survey_id)
    )
    responses = result.scalars().all()
    
    if not responses:
        return {"survey_id": survey_id, "funnel": []}
    
    # Analyze answers to build funnel
    question_counts = {}
    total_started = len(responses)
    
    for response in responses:
        if response.answers:
            for question_id in response.answers.keys():
                question_counts[question_id] = question_counts.get(question_id, 0) + 1
    
    # Build funnel data
    funnel = []
    for question_id, count in sorted(question_counts.items()):
        funnel.append({
            "question_id": question_id,
            "responses": count,
            "completion_rate": round((count / total_started) * 100, 2) if total_started > 0 else 0,
        })
    
    return {
        "survey_id": survey_id,
        "total_started": total_started,
        "funnel": funnel,
    }


@router.get("/analytics/distribution/{survey_id}/{question_id}")
async def get_answer_distribution(
    survey_id: str,
    question_id: str,
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    Get answer distribution for a specific question.
    
    Returns frequency count for each answer value.
    """
    # Get all responses with this question answered
    result = await db.execute(
        select(Response).where(Response.survey_id == survey_id)
    )
    responses = result.scalars().all()
    
    # Count answer frequencies
    distribution = {}
    total_answers = 0
    
    for response in responses:
        if response.answers and question_id in response.answers:
            answer = response.answers[question_id]
            
            # Handle different answer types
            if isinstance(answer, list):
                # Multiple choice - count each selected option
                for item in answer:
                    distribution[str(item)] = distribution.get(str(item), 0) + 1
                    total_answers += 1
            else:
                # Single value
                distribution[str(answer)] = distribution.get(str(answer), 0) + 1
                total_answers += 1
    
    # Convert to list format with percentages
    distribution_list = [
        {
            "value": value,
            "count": count,
            "percentage": round((count / total_answers) * 100, 2) if total_answers > 0 else 0,
        }
        for value, count in sorted(distribution.items(), key=lambda x: x[1], reverse=True)
    ]
    
    return {
        "survey_id": survey_id,
        "question_id": question_id,
        "total_answers": total_answers,
        "distribution": distribution_list,
    }


@router.get("/analytics/timeline/{survey_id}")
async def get_response_timeline(
    survey_id: str,
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    Get response timeline showing responses per day.
    
    Args:
        survey_id: Survey identifier
        days: Number of days to include (default: 30)
    """
    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get responses in date range
    result = await db.execute(
        select(Response).where(
            and_(
                Response.survey_id == survey_id,
                Response.created_at >= start_date,
                Response.created_at <= end_date
            )
        ).order_by(Response.created_at)
    )
    responses = result.scalars().all()
    
    # Group by date
    timeline = {}
    for response in responses:
        date_key = response.created_at.strftime('%Y-%m-%d')
        timeline[date_key] = timeline.get(date_key, 0) + 1
    
    # Fill in missing dates with 0
    current_date = start_date
    complete_timeline = []
    while current_date <= end_date:
        date_key = current_date.strftime('%Y-%m-%d')
        complete_timeline.append({
            "date": date_key,
            "count": timeline.get(date_key, 0),
        })
        current_date += timedelta(days=1)
    
    return {
        "survey_id": survey_id,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "timeline": complete_timeline,
    }


@router.get("/analytics/variants/{survey_id}")
async def get_variant_comparison(
    survey_id: str,
    db: AsyncSession = Depends(get_db),
    admin: TokenData = Depends(require_admin)
):
    """
    Compare performance across A/B test variants.
    
    Returns completion rates and response counts per variant.
    """
    # Get all responses
    result = await db.execute(
        select(Response).where(Response.survey_id == survey_id)
    )
    responses = result.scalars().all()
    
    # Group by variant
    variants = {}
    for response in responses:
        variant_id = response.variant_id or "default"
        if variant_id not in variants:
            variants[variant_id] = {
                "total": 0,
                "completed": 0,
            }
        variants[variant_id]["total"] += 1
        if response.completed_at:
            variants[variant_id]["completed"] += 1
    
    # Calculate metrics
    variant_stats = []
    for variant_id, stats in variants.items():
        completion_rate = (stats["completed"] / stats["total"] * 100) if stats["total"] > 0 else 0
        variant_stats.append({
            "variant_id": variant_id,
            "total_responses": stats["total"],
            "completed_responses": stats["completed"],
            "completion_rate": round(completion_rate, 2),
        })
    
    return {
        "survey_id": survey_id,
        "variants": sorted(variant_stats, key=lambda x: x["total_responses"], reverse=True),
    }
