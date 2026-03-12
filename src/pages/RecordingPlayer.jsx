import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../api/apiClient";

export default function RecordingPlayer() {

  const { recordingId, videoId } = useParams();
  const iframeRef = useRef(null);

  useEffect(() => {

    api
      .get(`/courses/recordings/${recordingId}/progress/`)
      .then(res => {

        const startTime = res.data.last_position;

        const player = iframeRef.current;

        player.src =
          `https://iframe.mediadelivery.net/embed/615730/${videoId}?start=${Math.floor(startTime)}`;

      });

  }, [recordingId, videoId]);

  return (
    <iframe
      ref={iframeRef}
      width="100%"
      height="500"
      allowFullScreen
    />
  );
}