/**
 * @since 2014/8/28 9:16
 * @author vivaxy
 */

const loadFont = async() => {
    const font = new FontFace('Royalacid', 'url(Royalacid.ttf)');
    await font.load();
    document.fonts.add(font);
    const p = document.createElement('p');
    p.innerHTML = 'Font loaded.';
    document.body.appendChild(p);
};

loadFont();
