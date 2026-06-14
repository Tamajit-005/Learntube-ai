import asyncio

from app.services.transcript_service import get_transcript
from app.services.chunk_service import create_chunks

from app.services.notes_service import generate_notes
from app.services.quiz_service import generate_mcqs
from app.services.flashcard_service import generate_flashcards
from app.services.interview_service import generate_interview_questions
from app.services.summary_service import generate_timestamps
from app.services.formula_service import extract_formulas
async def process_youtube_video(url):

    transcript = await get_transcript(url)

    chunks = create_chunks(transcript)

    # 2 concurrent calls max to stay under rate limits
    sem = asyncio.Semaphore(2)

    async def with_limit(fn):
        async with sem:
            return await fn

    combined_text = " ".join(chunks[:1])

    tasks = [
        with_limit(generate_notes(combined_text)),
        with_limit(generate_mcqs(combined_text)),
        with_limit(generate_flashcards(combined_text)),
        with_limit(generate_interview_questions(combined_text)),
        with_limit(extract_formulas(combined_text)),
    ]

    (
        notes,
        quizzes,
        flashcards,
        interview_questions,
        formulas,
    ) = await asyncio.gather(*tasks)

    timestamps = generate_timestamps(transcript)

    return {
        "notes": notes,
        "quizzes": quizzes,
        "flashcards": flashcards,
        "interview_questions": interview_questions,
        "timestamps": timestamps,
        "formulas": formulas,
    }
