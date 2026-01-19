# Audio Assets for Voice Chat

## Search Placeholder Audio

The file `search-placeholder.pcm` should be a brief audio file that plays while searching Orthodox documents during voice conversations.

### Format Requirements:
- Format: PCM16 (16-bit PCM)
- Sample Rate: 24000 Hz (24 kHz)
- Channels: 1 (Mono)
- Duration: 2-5 seconds (short loop)

### Suggested Content:
- Gentle ambient sound
- Soft musical tone
- Simple indicator sound

### Creating the Audio File:

You can create this file using ffmpeg:

```bash
# Convert any audio file to the required format
ffmpeg -i input.mp3 -f s16le -acodec pcm_s16le -ar 24000 -ac 1 search-placeholder.pcm

# Or create a simple sine wave tone (440 Hz for 3 seconds)
ffmpeg -f lavfi -i "sine=frequency=440:duration=3" -f s16le -acodec pcm_s16le -ar 24000 -ac 1 search-placeholder.pcm
```

### Note:
A placeholder file has been created. Replace it with your own audio for a better user experience. The application will gracefully handle if this file is missing or fails to load.

