/**
 * TFT 데이터 자동 갱신 스크립트
 *
 * Community Dragon에서 최신 TFT 데이터를 다운로드하고 파싱합니다.
 *
 * 사용법: npm run update-tft-data
 *
 * 갱신되는 파일:
 * - src/data/set16-champions.json (챔피언 데이터)
 * - src/data/set16-traits.json (특성 데이터)
 * - src/data/set16-items.json (아이템 데이터)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_URL = 'https://raw.communitydragon.org/latest/cdragon/tft/en_us.json';
const TEMP_FILE = path.join(__dirname, '..', 'tft_data_temp.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data');

// 현재 시즌 (필요시 변경)
const CURRENT_SET = '16';

/**
 * HTTPS로 파일 다운로드
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log('📥 Community Dragon 데이터 다운로드 중...');
    console.log(`   URL: ${url}`);

    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // 리다이렉트 처리
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`다운로드 실패: HTTP ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
        process.stdout.write(`\r   진행률: ${percent}% (${(downloadedSize / 1024 / 1024).toFixed(1)}MB)`);
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('\n✅ 다운로드 완료');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

/**
 * 챔피언 데이터 파싱
 */
function parseChampions(data) {
  const set = data.sets[CURRENT_SET];
  if (!set) {
    throw new Error(`Set ${CURRENT_SET} 데이터를 찾을 수 없습니다.`);
  }

  const champions = set.champions
    .filter(c => c.cost >= 1 && c.cost <= 5 && c.traits && c.traits.length > 0)
    .map(c => ({
      name: c.name.trim(),
      apiName: c.apiName,
      cost: c.cost,
      traits: c.traits,
      stats: {
        hp: c.stats.hp,
        damage: c.stats.damage,
        armor: c.stats.armor,
        magicResist: c.stats.magicResist,
        attackSpeed: parseFloat((c.stats.attackSpeed || 0).toFixed(2)),
        critChance: c.stats.critChance,
        critMultiplier: parseFloat((c.stats.critMultiplier || 0).toFixed(2)),
        mana: c.stats.mana,
        initialMana: c.stats.initialMana,
        range: c.stats.range
      },
      ability: {
        name: c.ability?.name || '',
        desc: c.ability?.desc || '',
        variables: c.ability?.variables || []
      }
    }))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

  return champions;
}

/**
 * 특성 데이터 파싱
 */
function parseTraits(data) {
  const set = data.sets[CURRENT_SET];
  if (!set) {
    throw new Error(`Set ${CURRENT_SET} 데이터를 찾을 수 없습니다.`);
  }

  const traits = set.traits.map(t => ({
    name: t.name,
    apiName: t.apiName,
    desc: t.desc,
    effects: t.effects.map(e => ({
      minUnits: e.minUnits,
      maxUnits: e.maxUnits,
      style: e.style,
      variables: e.variables
    }))
  })).sort((a, b) => a.name.localeCompare(b.name));

  return traits;
}

/**
 * 아이템 데이터 파싱
 */
function parseItems(data) {
  const items = data.items;

  // 기본 아이템 (component)
  const baseItems = items
    .filter(i => i.tags?.includes('component'))
    .reduce((acc, item) => {
      // 중복 제거
      if (!acc.find(i => i.name === item.name)) {
        acc.push({
          name: item.name,
          apiName: item.apiName,
          desc: item.desc,
          effects: item.effects,
          icon: item.icon
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name));

  // 조합 아이템
  const combinedItems = items
    .filter(i =>
      i.composition?.length === 2 &&
      i.apiName.startsWith('TFT_Item_') &&
      !i.apiName.includes('Radiant') &&
      !i.apiName.includes('Turbo')
    )
    .map(i => ({
      name: i.name,
      apiName: i.apiName,
      desc: i.desc,
      composition: i.composition.map(c => c.replace('TFT_Item_', '')),
      effects: i.effects,
      icon: i.icon
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // 찬란한 아이템 (Radiant)
  const radiantItems = items
    .filter(i => {
      if (!i.name) return false;
      if (!i.name.startsWith('Radiant ')) return false;
      if (i.apiName && i.apiName.includes('Spat')) return false; // 상징 제외
      if (i.name.includes('Item Chest')) return false;
      if (i.name.includes('Items')) return false; // '3 Radiant Items' 등 제외
      if (i.name === 'Radiant Item') return false;
      if (i.name.includes('Refactor')) return false; // 증강 제외
      if (i.name.includes('Rascal')) return false;
      if (i.name.includes('Relics')) return false;
      return true;
    })
    .map(i => ({
      name: i.name,
      apiName: i.apiName,
      desc: i.desc,
      effects: i.effects,
      icon: i.icon
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    base: baseItems,
    combined: combinedItems,
    radiant: radiantItems
  };
}

/**
 * JSON 파일 저장
 */
function saveJson(filename, data) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  const size = (fs.statSync(filepath).size / 1024).toFixed(1);
  console.log(`   ${filename} (${size}KB)`);
}

/**
 * 메인 실행
 */
async function main() {
  console.log('');
  console.log('🎮 TFT Set ' + CURRENT_SET + ' 데이터 갱신 시작');
  console.log('='.repeat(50));

  try {
    // 1. 다운로드
    await downloadFile(DATA_URL, TEMP_FILE);

    // 2. 파싱
    console.log('\n📊 데이터 파싱 중...');
    const rawData = JSON.parse(fs.readFileSync(TEMP_FILE, 'utf8'));

    const champions = parseChampions(rawData);
    const traits = parseTraits(rawData);
    const items = parseItems(rawData);

    // 3. 저장
    console.log('\n💾 파일 저장 중...');
    saveJson('set16-champions.json', champions);
    saveJson('set16-traits.json', traits);
    saveJson('set16-items.json', items);

    // 4. 임시 파일 삭제
    fs.unlinkSync(TEMP_FILE);

    // 5. 요약
    console.log('\n' + '='.repeat(50));
    console.log('✅ 갱신 완료!');
    console.log('');
    console.log('📈 데이터 요약:');
    console.log(`   챔피언: ${champions.length}명`);
    console.log(`   특성: ${traits.length}개`);
    console.log(`   기본 아이템: ${items.base.length}개`);
    console.log(`   조합 아이템: ${items.combined.length}개`);
    console.log(`   찬란한 아이템: ${items.radiant.length}개`);
    console.log('');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);

    // 임시 파일 정리
    if (fs.existsSync(TEMP_FILE)) {
      fs.unlinkSync(TEMP_FILE);
    }

    process.exit(1);
  }
}

main();
