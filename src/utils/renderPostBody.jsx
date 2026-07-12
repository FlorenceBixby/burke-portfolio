export default function renderPostBody(body, classes = {}) {
  return body.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return <h2 key={i} className={classes.h2}>{line.slice(3)}</h2>
    if (line.startsWith('# ')) return <h1 key={i} className={classes.h1}>{line.slice(2)}</h1>
    if (line.trim() === '') return <br key={i} />
    return <p key={i} className={classes.p}>{line}</p>
  })
}
