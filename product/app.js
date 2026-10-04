(function () {
  const manifestUrl = 'data/product-manifest.json';
  const fallbackStages = [
    { id: 'find', number: '01', verb: 'Find', owner: 'Andy', tool: 'Site Scoping', question: 'Where should we investigate?', contribution: 'A candidate signal with identity, sources and explicit evidence questions.', boundary: 'A screening score does not establish street geometry, soil, utilities or feasibility.', url: 'contributions/andy/current/index.html', demoUrl: 'contributions/andy/current/index.html', status: 'ready-for-andy-port' },
    { id: 'classify', number: '02', verb: 'Classify', owner: 'Achim', tool: 'Data Charter', question: 'What kind of evidence do we have?', contribution: 'Evidence is marked as known, derived, assumed, modelled, restricted or missing.', boundary: 'A relevant dataset is not automatically valid for the intended decision.', url: 'stage.html#classify', demoUrl: 'stage.html#classify', status: 'working' },
    { id: 'gate', number: '03', verb: 'Gate', owner: 'Achim', tool: 'Street X-Ray', question: 'What prevents a real decision?', contribution: 'Visible context, hypotheses, blockers, gatekeepers and next evidence actions.', boundary: 'Visible space is not automatically buildable space.', url: '../wrapper/street-xray/index.html', demoUrl: '../wrapper/street-xray/index.html', status: 'working-slice' },
    { id: 'observe', number: '04', verb: 'Observe', owner: 'Achim + citizens', tool: 'Rain Walk', question: 'What can people responsibly verify?', contribution: 'A provenance-bearing field observation plan with review history.', boundary: 'Surface observation cannot reveal underground utilities or infiltration performance.', url: '../wrapper/street-workspace/public/rain-walk/index.html', demoUrl: '../wrapper/street-workspace/public/rain-walk/index.html', status: 'working-demo' },
    { id: 'explore', number: '05', verb: 'Explore', owner: 'Simon + Achim', tool: 'Visual Street + Street Lab', question: 'What could change, and how might it work?', contribution: 'A visual intervention concept and an illustrative, deterministic water pathway.', boundary: 'The scenario explains a mechanism; it does not validate engineering performance.', url: '../frontend/v1/index.html', demoUrl: '../frontend/v1/index.html', status: 'working-mvp' },
    { id: 'decide', number: '06', verb: 'Decide', owner: 'Team', tool: 'Connected Case', question: 'What is the next defensible action?', contribution: 'A bounded decision packet linking claims, gaps, gatekeepers and actions.', boundary: 'The current state is investigation, not a recommendation to construct.', url: 'stage.html#decide', demoUrl: 'stage.html#decide', status: 'contract-v1' }
  ];

  const state = { stages: fallbackStages, selected: 0 };
  const rail = document.getElementById('journey-rail');
  const toolGrid = document.getElementById('tool-grid');
  const demoSelect = document.getElementById('demo-stage');
  const demoFrame = document.getElementById('demo-frame');
  const demoOpen = document.getElementById('demo-open');

  function stageButtons() {
    rail.innerHTML = state.stages.map((stage, index) => `
      <button class="journey-step" type="button" role="tab" aria-selected="${index === state.selected}" data-stage="${index}">
        <span>${stage.number} · ${stage.verb}</span>
        <strong>${stage.tool}</strong>
        <small>${stage.question}</small>
      </button>`).join('');
    rail.querySelectorAll('[data-stage]').forEach((button) => {
      button.addEventListener('click', () => selectStage(Number(button.dataset.stage), false));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const next = (Number(button.dataset.stage) + delta + state.stages.length) % state.stages.length;
        selectStage(next, false);
        rail.querySelector(`[data-stage="${next}"]`).focus();
      });
    });
  }

  function toolCards() {
    toolGrid.innerHTML = state.stages.map((stage) => `
      <article class="tool-card">
        <span class="num">${stage.number} · ${stage.owner}</span>
        <h3>${stage.tool}</h3>
        <p><strong>${stage.question}</strong></p>
        <p>${stage.contribution}</p>
        <a href="${stage.url}">Open module →</a>
      </article>`).join('');
  }

  function demoOptions() {
    demoSelect.innerHTML = state.stages.map((stage, index) => `<option value="${index}">${stage.number} · ${stage.tool}</option>`).join('');
    demoSelect.addEventListener('change', () => selectStage(Number(demoSelect.value), true));
  }

  function selectStage(index, updateDemo) {
    state.selected = index;
    const stage = state.stages[index];
    rail.querySelectorAll('[data-stage]').forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    document.getElementById('stage-meta').textContent = `${stage.number} · ${stage.owner} · ${stage.status.replaceAll('-', ' ')}`;
    document.getElementById('stage-question').textContent = stage.question;
    document.getElementById('stage-title').textContent = stage.tool;
    document.getElementById('stage-contribution').textContent = stage.contribution;
    document.getElementById('stage-boundary').textContent = stage.boundary;
    document.getElementById('stage-link').href = stage.url;

    if (updateDemo) updateDemoFrame(stage, index);
  }

  function updateDemoFrame(stage, index) {
    demoSelect.value = String(index);
    document.getElementById('demo-title').textContent = stage.tool;
    document.getElementById('demo-question').textContent = stage.question;
    document.getElementById('demo-boundary').textContent = stage.boundary;
    document.getElementById('demo-state').textContent = `${stage.owner} · ${stage.status.replaceAll('-', ' ')}`;
    demoOpen.href = stage.url;
    demoFrame.src = stage.demoUrl || stage.url;
    demoFrame.title = `${stage.tool}: ${stage.question}`;
  }

  function setupViewSwitch() {
    const buttons = document.querySelectorAll('[data-view-button]');
    const panels = document.querySelectorAll('[data-view-panel]');
    buttons.forEach((button) => button.addEventListener('click', () => {
      const view = button.dataset.viewButton;
      buttons.forEach((item) => {
        const active = item.dataset.viewButton === view;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      panels.forEach((panel) => { panel.hidden = panel.dataset.viewPanel !== view; });
    }));
  }

  async function loadManifest() {
    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const manifest = await response.json();
      if (!Array.isArray(manifest.stages) || manifest.stages.length !== 6) throw new Error('Expected six product stages');
      state.stages = manifest.stages;
      document.getElementById('demo-state').textContent = `${manifest.case.label} · ${manifest.case.decisionState.replaceAll('-', ' ')}`;
    } catch (error) {
      document.getElementById('demo-state').textContent = 'Bundled fallback · manifest unavailable';
      console.warn('Using bundled product manifest fallback:', error);
    }
    stageButtons();
    toolCards();
    demoOptions();
    selectStage(0, true);
  }

  setupViewSwitch();
  loadManifest();
})();
