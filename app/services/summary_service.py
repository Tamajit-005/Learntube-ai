def generate_timestamps(transcript, max_items=60):

    if len(transcript) <= max_items:
        return [
            {"timestamp": item["start"], "summary": item["text"]}
            for item in transcript
        ]

    # Sample evenly across the full video
    step = len(transcript) / max_items
    summaries = []
    for i in range(max_items):
        idx = min(int(i * step), len(transcript) - 1)
        item = transcript[idx]
        summaries.append({
            "timestamp": item["start"],
            "summary": item["text"]
        })

    return summaries
