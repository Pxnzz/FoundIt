'use strict';

const statusElement = document.getElementById('server-status');

async function checkHealth() {
  try {
    const response = await fetch('/api/health', { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Health check failed');
    const result = await response.json();
    if (result.status !== 'ok') throw new Error('Unexpected response');
    statusElement.textContent = 'Backend is ready';
  } catch {
    statusElement.textContent = 'Backend is unavailable. Please try again later.';
  }
}

checkHealth();
