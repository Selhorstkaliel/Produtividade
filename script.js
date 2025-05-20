
    const principal = document.querySelector('.principal');
    const actionsMenu = document.querySelector('.actions');
    principal.addEventListener('click', () => actionsMenu.classList.toggle('show'));

    const form = document.getElementById('dev-form');
    const nomeInput = document.getElementById('nome');
    const horasInput = document.getElementById('horas');
    const producoesInput = document.getElementById('producoes');
    const descricaoInput = document.getElementById('descricao');
    const rankingDiv = document.getElementById('ranking');
    let devs = JSON.parse(localStorage.getItem('devs')) || [];
    let editingIndex = null;

    function calcularProdutividade(dev) { return dev.horas + dev.producoes * 2; }
    function salvarDados() { localStorage.setItem('devs', JSON.stringify(devs)); }

    function atualizarRanking() {
      rankingDiv.innerHTML = '';
      devs.sort((a, b) => calcularProdutividade(b) - calcularProdutividade(a));
      devs.forEach((dev, index) => {
        const card = document.createElement('div');
        card.className = `dev-card ${index === 0 ? 'top' : index === devs.length - 1 ? 'low' : ''}`;
        card.dataset.index = index;
        card.innerHTML = `
          <div class="dev-header">
            <span><strong>👤 ${dev.nome}</strong></span>
            <button class="delete-btn">❌</button>
          </div>
          <div id="info-dev">
            <span>⏱️ ${dev.horas}h | 📦 ${dev.producoes} prod. | ⚡ ${calcularProdutividade(dev)} pts</span><br>
            <p style="margin-top:10px; font-size:13px;">📝 ${dev.descricao || 'Sem descrição registrada.'}</p>
          </div>`;
        rankingDiv.appendChild(card);
      });
    }

    rankingDiv.addEventListener('click', e => {
      const card = e.target.closest('.dev-card');
      if (!card) return;
      const idx = parseInt(card.dataset.index, 10);
      if (e.target.classList.contains('delete-btn')) {
        devs.splice(idx, 1);
        salvarDados();
        atualizarRanking();
        return;
      }
      editingIndex = idx;
      const dev = devs[idx];
      nomeInput.value = dev.nome;
      horasInput.value = dev.horas;
      producoesInput.value = dev.producoes;
      descricaoInput.value = dev.descricao;
      nomeInput.focus();
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const nome = nomeInput.value.trim();
      const horas = parseInt(horasInput.value, 10);
      const producoes = parseInt(producoesInput.value, 10);
      const descricao = descricaoInput.value.trim();
      if (!nome || isNaN(horas) || isNaN(producoes)) return;
      if (editingIndex !== null) {
        devs[editingIndex] = { nome, horas, producoes, descricao };
      } else {
        devs.push({ nome, horas, producoes, descricao });
      }
      salvarDados();
      atualizarRanking();
      form.reset();
      editingIndex = null;
    });

    function baixarJSON() {
      const dataStr = JSON.stringify(devs, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'produtividade_devs.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    }
    document.getElementById('importarJSON').addEventListener('change', e => {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const imported = JSON.parse(ev.target.result);
          if (!Array.isArray(imported)) throw new Error();
          devs = imported;
          salvarDados();
          atualizarRanking();
        } catch {
          alert('Formato de arquivo inválido!');
        }
      };
      reader.readAsText(file);
    });
    document.getElementById('btnNewFile').addEventListener('click', () => {
      if (confirm('Confirmar reset de todos os dados?')) {
        localStorage.removeItem('devs'); devs = []; atualizarRanking(); form.reset();
        editingIndex = null;
      }
    });
    document.getElementById('btnImportFile').addEventListener('click', () => document.getElementById('importarJSON').click());
    document.getElementById('btnExportFile').addEventListener('click', baixarJSON);

    atualizarRanking();
