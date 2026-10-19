(() => {
  if(document.querySelector('.swimming-ocean')) return;
  const ocean = document.createElement('div');
  ocean.className = 'swimming-ocean';
  ocean.setAttribute('aria-hidden','true');
  const school = [
    ['2%','290px','.24','68s','-18s'],
    ['18%','190px','.30','84s','-64s'],
    ['54%','360px','.20','96s','-42s'],
    ['74%','220px','.28','76s','-51s'],
    ['38%','150px','.26','100s','-20s'],
    ['9%','130px','.32','65s','-39s'],
    ['30%','250px','.22','90s','-73s'],
    ['61%','160px','.30','72s','-16s'],
    ['83%','140px','.28','81s','-44s'],
    ['43%','200px','.25','88s','-54s'],
    ['23%','120px','.32','62s','-9s'],
    ['69%','180px','.26','93s','-79s']
  ];
  school.forEach(([depth,size,alpha,duration,delay])=>{
    const ray = document.createElement('div');
    ray.className='ocean-ray';
    Object.entries({depth,size,alpha,duration,delay}).forEach(([key,value])=>ray.style.setProperty(`--${key}`,value));
    const img = document.createElement('img');
    img.src='/RAYVYN/rayvyn-logo.png';img.alt='';img.decoding='async';
    ray.appendChild(img);ocean.appendChild(ray);
  });
  document.body.appendChild(ocean);
  document.addEventListener('visibilitychange',()=>document.body.classList.toggle('ocean-hidden',document.hidden));
})();
