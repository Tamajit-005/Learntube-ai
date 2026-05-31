def create_chunks(transcript, chunk_size=3000):
    text = " ".join([item["text"] for item in transcript])
    words = text.split()

    chunks = []

    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)

    return chunks
