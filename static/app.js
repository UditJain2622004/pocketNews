const state = { episode: null, storyIndex: 0, beatIndex: 0, isPlaying: false, isMuted: false, beatTimer: null, beatStartedAt: 0, beatElapsed: 0 };
const elements = {
  title: document.querySelector('#episode-title'), kicker: document.querySelector('#episode-kicker'), list: document.querySelector('#story-list'), count: document.querySelector('#story-count'), image: document.querySelector('#story-image'), stage: document.querySelector('#visual-stage'), type: document.querySelector('#story-type'), visualTitle: document.querySelector('#visual-title'), caption: document.querySelector('#visual-caption'), elapsed: document.querySelector('#elapsed'), duration: document.querySelector('#duration'), progress: document.querySelector('#track-progress'), play: document.querySelector('#play-button'), skip: document.querySelector('#skip-button'), previous: document.querySelector('#previous-button'), mute: document.querySelector('#mute-button'), restart: document.querySelector('#restart-button'), source: document.querySelector('#source-link'), build: document.querySelector('#build-episode'), hint: document.querySelector('#skip-hint'),
};

async function buildEpisode() {
  stopPlayback();
  const interests = [...document.querySelectorAll('.chip.is-selected')].map((chip) => chip.dataset.interest).join(',');
  const cadence = document.querySelector('.segment.is-selected').dataset.cadence;
  elements.build.disabled = true;
  elements.build.textContent = 'Building your episode...';
  try {
    const response = await fetch(`/api/episodes?interests=${encodeURIComponent(interests)}&cadence=${cadence}&story_count=3`);
    if (!response.ok) throw new Error('Episode request failed');
    state.episode = await response.json();
    state.storyIndex = 0;
    state.beatIndex = 0;
    state.beatElapsed = 0;
    renderEpisode();
  } catch (error) {
    elements.visualTitle.textContent = 'The newsroom hit a snag.';
    elements.caption.textContent = 'Please try building the episode again.';
  } finally {
    elements.build.disabled = false;
    elements.build.innerHTML = '<i data-lucide="sparkles"></i> Build my episode';
    lucide.createIcons();
  }
}

function renderEpisode() {
  elements.title.textContent = state.episode.title;
  elements.kicker.textContent = `${state.episode.cadence} edition`;
  elements.count.textContent = `${state.episode.storyCount} stories`;
  elements.list.innerHTML = '';
  const template = document.querySelector('#story-template');
  state.episode.stories.forEach((story, index) => {
    const row = template.content.firstElementChild.cloneNode(true);
    row.dataset.index = index;
    row.querySelector('.story-number').textContent = String(index + 1).padStart(2, '0');
    row.querySelector('.story-category').textContent = story.category;
    row.querySelector('.story-title').textContent = story.title;
    row.querySelector('.story-meta').textContent = `${story.format.replaceAll('-', ' ')} · ${story.durationSeconds}s`;
    row.addEventListener('click', () => selectStory(index, true));
    elements.list.append(row);
  });
  renderCurrentBeat();
  lucide.createIcons();
}

function currentStory() { return state.episode.stories[state.storyIndex]; }
function currentBeat() { return currentStory().beats[state.beatIndex]; }

function renderCurrentBeat() {
  if (!state.episode) return;
  const story = currentStory();
  const beat = currentBeat();
  const visual = beat.visual;
  elements.image.style.opacity = '0';
  window.setTimeout(() => { elements.image.src = visual.imageUrl; elements.image.style.opacity = '.88'; }, 120);
  elements.image.alt = `Editorial visual: ${visual.caption}`;
  elements.stage.className = `visual-stage tone-${visual.tone} is-moving`;
  elements.type.textContent = beat.kind.replaceAll('-', ' ');
  elements.visualTitle.textContent = story.title;
  elements.caption.textContent = visual.caption;
  elements.source.href = story.sources[0].url || '#';
  elements.source.style.visibility = story.sources[0].url ? 'visible' : 'hidden';
  elements.duration.textContent = formatTime(story.durationSeconds);
  elements.hint.textContent = state.beatIndex === 0 ? `Now: ${story.skipLabel}. Skip whenever you want.` : story.exit;
  updateQueue();
  updateProgress();
}

function updateQueue() {
  document.querySelectorAll('.story-row').forEach((row) => row.classList.toggle('is-active', Number(row.dataset.index) === state.storyIndex));
}

function selectStory(index, autoplay) {
  stopPlayback();
  state.storyIndex = index;
  state.beatIndex = 0;
  state.beatElapsed = 0;
  renderCurrentBeat();
  if (autoplay) startPlayback();
}

function startPlayback() {
  if (!state.episode) return;
  state.isPlaying = true;
  elements.play.innerHTML = '<i data-lucide="pause"></i>';
  elements.play.setAttribute('aria-label', 'Pause episode');
  lucide.createIcons();
  speakBeat();
  scheduleBeat();
}

function pausePlayback() {
  state.isPlaying = false;
  clearTimeout(state.beatTimer);
  state.beatElapsed += Date.now() - state.beatStartedAt;
  window.speechSynthesis?.cancel();
  elements.play.innerHTML = '<i data-lucide="play"></i>';
  elements.play.setAttribute('aria-label', 'Play episode');
  lucide.createIcons();
}

function stopPlayback() {
  clearTimeout(state.beatTimer);
  window.speechSynthesis?.cancel();
  state.isPlaying = false;
  state.beatElapsed = 0;
  elements.play.innerHTML = '<i data-lucide="play"></i>';
  lucide.createIcons();
}

function scheduleBeat() {
  const remaining = Math.max(200, currentBeat().visual.durationSeconds * 1000 - state.beatElapsed);
  state.beatStartedAt = Date.now();
  state.beatTimer = window.setTimeout(nextBeat, remaining);
}

function nextBeat() {
  state.beatElapsed = 0;
  if (state.beatIndex < currentStory().beats.length - 1) {
    state.beatIndex += 1;
  } else if (state.storyIndex < state.episode.stories.length - 1) {
    state.storyIndex += 1;
    state.beatIndex = 0;
  } else {
    stopPlayback();
    elements.hint.textContent = state.episode.outro;
    updateProgress();
    return;
  }
  renderCurrentBeat();
  if (state.isPlaying) { speakBeat(); scheduleBeat(); }
}

function skipStory() {
  if (!state.episode || state.storyIndex === state.episode.stories.length - 1) return;
  const keepPlaying = state.isPlaying;
  stopPlayback();
  state.storyIndex += 1;
  state.beatIndex = 0;
  renderCurrentBeat();
  if (keepPlaying) startPlayback();
}

function speakBeat() {
  if (state.isMuted || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  currentBeat().lines.forEach((line) => {
    const speech = new SpeechSynthesisUtterance(line.text);
    speech.rate = line.speaker === 'leo' ? 1.07 : 1;
    speech.pitch = line.speaker === 'leo' ? .86 : 1.08;
    window.speechSynthesis.speak(speech);
  });
}

function updateProgress() {
  if (!state.episode) return;
  const story = currentStory();
  const completed = story.beats.slice(0, state.beatIndex).reduce((total, beat) => total + beat.visual.durationSeconds, 0);
  const liveElapsed = state.isPlaying ? (Date.now() - state.beatStartedAt) / 1000 : state.beatElapsed / 1000;
  const seconds = Math.min(story.durationSeconds, completed + liveElapsed);
  elements.elapsed.textContent = formatTime(seconds);
  elements.progress.style.width = `${Math.min(100, (seconds / story.durationSeconds) * 100)}%`;
  if (state.isPlaying) requestAnimationFrame(updateProgress);
}

function formatTime(seconds) { const whole = Math.max(0, Math.floor(seconds)); return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`; }

document.querySelectorAll('.chip').forEach((chip) => chip.addEventListener('click', () => chip.classList.toggle('is-selected')));
document.querySelectorAll('.segment').forEach((segment) => segment.addEventListener('click', () => { document.querySelectorAll('.segment').forEach((item) => item.classList.remove('is-selected')); segment.classList.add('is-selected'); }));
elements.build.addEventListener('click', buildEpisode);
elements.play.addEventListener('click', () => state.isPlaying ? pausePlayback() : startPlayback());
elements.skip.addEventListener('click', skipStory);
elements.previous.addEventListener('click', () => { if (state.episode) selectStory(Math.max(0, state.storyIndex - 1), state.isPlaying); });
elements.restart.addEventListener('click', () => { if (state.episode) selectStory(0, false); });
elements.mute.addEventListener('click', () => { state.isMuted = !state.isMuted; window.speechSynthesis?.cancel(); elements.mute.innerHTML = `<i data-lucide="${state.isMuted ? 'volume-x' : 'volume-2'}"></i>`; lucide.createIcons(); });
buildEpisode();
