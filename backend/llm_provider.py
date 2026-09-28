import os
import hashlib
import json
import httpx
from typing import Optional, Literal
from pydantic import BaseModel, Field

class GeneratedNarratives(BaseModel):
    why_this_match: str = Field(description="Explanatory rationale of mathematical convergence")
    leak_path_narrative: str = Field(description="Narrative explanation of how document exfiltrated")
    dossier_prose: str = Field(description="Legal assessment for Section 63 BSA certificate")
    security_message_draft: str = Field(description="Priority alert draft for Western Command Security")
    source: Literal["llm", "template"] = "template"

class LLMProvider:
    def __init__(self):
        self._refresh_config()
        self._cache: dict[str, GeneratedNarratives] = {}

    def _refresh_config(self):
        self.provider = os.environ.get("LLM_PROVIDER", "gemini").lower()
        self.model = os.environ.get("LLM_MODEL", "gemini-2.5-flash")
        self.api_key = os.environ.get("GOOGLE_API_KEY", "")
        self.air_gapped = os.environ.get("AIR_GAPPED", "false").lower() in ("true", "1", "yes")
        self.ollama_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")

    def get_status(self) -> dict:
        """Returns health status without leaking API key."""
        self._refresh_config()
        if self.air_gapped:
            return {"provider": "template", "status": "ok", "mode": "air_gapped", "cloud_blocked": True}
        if self.provider == "gemini":
            status = "ok" if self.api_key else "degraded"
            return {"provider": "gemini", "status": status, "model": self.model, "cloud_blocked": False}
        elif self.provider == "ollama":
            return {"provider": "ollama", "status": "ok", "model": self.model, "cloud_blocked": False}
        return {"provider": "template", "status": "ok", "mode": "sovereign", "cloud_blocked": True}

    async def generate_narratives(self, structured_data: dict) -> GeneratedNarratives:
        """
        Generates prose narratives from purely structured numbers/IDs.
        NEVER receives file bytes, images, or classified text.
        """
        self._refresh_config()
        # Cache key based on SHA256 of structured JSON
        cache_key = hashlib.sha256(json.dumps(structured_data, sort_keys=True).encode("utf-8")).hexdigest()
        if cache_key in self._cache:
            return self._cache[cache_key]

        if self.air_gapped or self.provider == "template":
            result = self._template_fallback(structured_data)
            self._cache[cache_key] = result
            return result

        # Attempt LLM with fast timeout; fallback instantly to template
        if self.provider == "gemini" and self.api_key:
            try:
                result = await self._call_gemini(structured_data)
                self._cache[cache_key] = result
                return result
            except Exception:
                pass
        elif self.provider == "ollama":
            try:
                result = await self._call_ollama(structured_data)
                self._cache[cache_key] = result
                return result
            except Exception:
                pass

        # Fallback to deterministic sovereign template immediately
        result = self._template_fallback(structured_data)
        self._cache[cache_key] = result
        return result

    async def _call_gemini(self, data: dict) -> GeneratedNarratives:
        prompt = (
            "You are the Indian Navy Sovereign Cryptographic Provenance (NAV-TRAC X) intelligence officer.\n"
            "Based strictly on the following structured evidence, return a valid JSON object with fields: "
            "'why_this_match', 'leak_path_narrative', 'dossier_prose', 'security_message_draft'.\n"
            f"Structured Evidence:\n{json.dumps(data, indent=2)}\n"
            "Requirements:\n"
            "- Formal naval military tone.\n"
            "- 'why_this_match': 2-3 sentences detailing watermark fragments and ledger checks.\n"
            "- 'leak_path_narrative': 2-3 sentences describing the capture channel and timestamps.\n"
            "- 'dossier_prose': 2 sentences on Section 63 BSA electronic evidence compliance.\n"
            "- 'security_message_draft': 2 sentences alerting Western Naval Command Security."
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "responseMimeType": "application/json"}
        }

        async with httpx.AsyncClient(timeout=0.8) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                res_json = resp.json()
                text = res_json["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text)
                return GeneratedNarratives(
                    why_this_match=parsed.get("why_this_match", ""),
                    leak_path_narrative=parsed.get("leak_path_narrative", ""),
                    dossier_prose=parsed.get("dossier_prose", ""),
                    security_message_draft=parsed.get("security_message_draft", ""),
                    source="llm"
                )
        raise RuntimeError("Gemini call failed or timed out")

    async def _call_ollama(self, data: dict) -> GeneratedNarratives:
        prompt = f"Return JSON with 'why_this_match', 'leak_path_narrative', 'dossier_prose', 'security_message_draft' for data: {json.dumps(data)}"
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.post(
                f"{self.ollama_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "format": "json", "stream": False}
            )
            if resp.status_code == 200:
                parsed = json.loads(resp.json()["response"])
                return GeneratedNarratives(
                    why_this_match=parsed.get("why_this_match", ""),
                    leak_path_narrative=parsed.get("leak_path_narrative", ""),
                    dossier_prose=parsed.get("dossier_prose", ""),
                    security_message_draft=parsed.get("security_message_draft", ""),
                    source="llm"
                )
        raise RuntimeError("Ollama call failed")

    def _template_fallback(self, data: dict) -> GeneratedNarratives:
        outcome = data.get("outcome", "Verified")
        conf = data.get("confidence", 0.0)
        officer = data.get("recipient_name", "Unknown Officer")
        rank = data.get("recipient_rank", "Officer")
        vessel = data.get("unit_vessel", "Naval Fleet")
        doc_id = data.get("document_id", "Classified Document")
        method = data.get("capture_method", "Digital capture")
        block_num = data.get("ledger_block", 4192)

        if outcome == "Verified":
            why = (
                f"Multi-band DWT-DCT watermark extraction correlates with {rank} {officer} ({vessel}) "
                f"at {conf:.1f}% confidence. Hardware cryptographic session and Merkle block #{block_num} verified."
            )
            leak = (
                f"Artifact exhibits physical characteristics of {method}. "
                f"Decryption timestamp aligns with authorized terminal session on board {vessel}."
            )
            dossier = (
                f"The cryptographic hash chain and digital signature for {doc_id} satisfy Section 63 "
                "of the Bharatiya Sakshya Adhiniyam 2023 for uncorrupted electronic evidence."
            )
            sec = (
                f"PRIORITY ALERT: Classified document {doc_id} traced to {rank} {officer} ({vessel}). "
                "Immediate EMCON protocol and terminal seizure recommended."
            )
        elif outcome == "Manipulation Suspected":
            why = (
                f"Steganographic payload altered. Hash mismatch detected between carrier signature "
                f"and immutable ledger block #{block_num}. Counter-intelligence manipulation suspected."
            )
            leak = "Tampered artifact discovered on tactical channel with modified cryptographic headers."
            dossier = "Evidence fails strict integrity verification under Section 63 BSA 2023 due to hash pointer divergence."
            sec = "WARNING: Tampered naval document detected. Initiate counter-intelligence audit of signing nodes."
        elif outcome == "Contradictory":
            why = "Watermark payload points to valid recipient key, but registered document hash conflicts with origin record."
            leak = "Possible cross-document keying error or deliberate frame attempt."
            dossier = "Conflicting provenance metadata invalidates judicial presumption under Section 63 BSA."
            sec = "SECURITY NOTICE: Conflicting attribution records detected across fleet distribution nodes."
        elif outcome == "Unresolved":
            why = f"Carrier signal degraded ({conf:.1f}% confidence). Insufficient spatial resolution to achieve singular attribution."
            leak = f"Artifact captured via {method} with excessive optical blur or heavy crop."
            dossier = "Preliminary investigative lead; insufficient resolution for Section 63 BSA certification."
            sec = "Advisory: Degraded classified artifact intercepted. Enhanced sensor capture requested."
        else: # No Match
            why = "Zero registered NAV-TRAC X steganographic watermarks or provenance signatures recovered."
            leak = "Unindexed briefing photograph or external non-sovereign document."
            dossier = "Inadmissible as an internal sovereign naval record under Section 63 BSA 2023."
            sec = "External open-source intelligence artifact logged. No domestic naval breach indicated."

        return GeneratedNarratives(
            why_this_match=why,
            leak_path_narrative=leak,
            dossier_prose=dossier,
            security_message_draft=sec,
            source="template"
        )

llm_provider = LLMProvider()
