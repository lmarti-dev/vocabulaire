var current_search_value = null
var current_mode = null

var TOPICS = null

var SEM_OPTIONS = ['indicateur', 'domaine']
var WHICH = SEM_OPTIONS[0]

async function load_json (url) {
  return await (await fetch(url, { method: 'GET' })).json()
}

function create_voc_list_item (word, desc) {
  let item = document.createElement('li')
  item.setAttribute('class', 'mot list-group-item d-flex flex-row flex-wrap')
  slug = word.replace(/(,| ou | \().*/gm, '')
  href = `https://www.littre.org/recherche?mot=${slug.toLowerCase()}`
  item.innerHTML = `<a target='_blank' class='px-2 fw-bold' href='${href}'>${word.toUpperCase()}</a><p class='w-100 flex-grow-1 small px-2 text-secondary'>${desc}</p>`
  return item
}
function create_topic_list_item (filename, data) {
  let name = data[0]
  let number = data[1]
  let item = document.createElement('a')
  let cat = document.createElement('p')
  item.setAttribute(
    'class',
    'list-group-item-action list-group-item d-flex flex-row p-3'
  )

  cat.setAttribute('class', 'align-self-center fw-semibold my-0 fs-5')
  item.setAttribute('href', `#`)
  cat.innerHTML = name.toUpperCase()
  item.addEventListener('click', e => {
    pick_voc_list(filename, name)
  })
  let n_mots = document.createElement('p')
  n_mots.setAttribute(
    'class',
    'text-body-tertiary small mx-2   fw-normal my-0 fs-6'
  )
  n_mots.innerHTML = `${number} mots`
  item.appendChild(cat)
  item.appendChild(n_mots)
  return item
}

function show_voc (__voc) {
  let voc_items = document.getElementById('voc-items')
  for (k of Object.keys(__voc)) {
    voc_items.appendChild(create_voc_list_item(k, __voc[[k]]))
  }
}

function reset_search_value () {
  search = document.getElementById('search-form')
  search.value = ''
}

async function pick_voc_list (filename, name) {
  let __voc = await load_json(`./files/${WHICH}/merged/${filename}`)
  let voc_title = document.getElementById('voc-title')
  voc_title.innerHTML = `<h1>${name}</h1>`

  document.title = name
  current_voc = [filename, name]

  setup_search('voc')

  show_voc(__voc)

  let voc_title_line = document.getElementById('voc-title-line')
  unhide(voc_title_line)

  current_mode = 'voc'
  reset_search_value()

  let topics = document.getElementById('topic-list')
  hide(topics)
}

function show_topics (__topics) {
  let topics = document.getElementById('topic-list')
  unhide(topics)
  topics.innerHTML = ''
  current_voc = null
  var ks = Object.keys(__topics)
  for (var j = 0; j < ks.length; j++) {
    topics.appendChild(create_topic_list_item(ks[j], __topics[[ks[j]]]))
  }
  current_mode = 'topics'
}

async function load_and_show_list () {
  let voc_title_line = document.getElementById('voc-title-line')
  hide(voc_title_line)

  current_search_value = ''

  TOPICS = await load_json(`./files/${WHICH}/merged/__manifest.json`)
  search = document.getElementById('search-form')
  search.setAttribute('disabled', null)

  show_topics(TOPICS)
  setup_search()

  current_mode = 'topics'
}

function unhide_voc_items () {
  let voc_title_line = document.getElementById('voc-title-line')
  unhide(voc_title_line)
  let voc_items = document.getElementById('voc-items')
  for (let child of voc_items.children) {
    unhide(child)
  }
}

function reset_topics () {
  document.title = 'Vocabulaire'
  let voc_items = document.getElementById('voc-items')
  voc_items.innerHTML = ''
  let voc_title_line = document.getElementById('voc-title-line')
  hide(voc_title_line)
  show_topics(TOPICS)
}

function reset (to) {
  if (to == 'topics') {
    reset_topics()
  } else if (to == 'voc') {
    unhide_voc_items()
  }
}

function rebuild_dict (d, ks) {
  let new_dict = {}
  for (k of ks) {
    new_dict[[k]] = d[[k]]
  }
  return new_dict
}

function filter_topics (value) {
  let re = new RegExp(value, 'i')
  let remaining_keys = Object.keys(TOPICS).filter(e => re.test(TOPICS[[e]][0]))

  let remaining_topics = rebuild_dict(TOPICS, remaining_keys)
  show_topics(remaining_topics)
  current_search_value = value
}

function filter_voc (value) {
  let re = new RegExp(value, 'i')
  let words = document.getElementsByClassName('mot')
  unhide_voc_items()

  for (let word of words) {
    if (!re.test(word.getElementsByTagName('a')[0].innerHTML)) {
      hide(word)
    }
  }

  current_search_value = value
}

function setup_search () {
  var typingTimer
  var doneTypingInterval = 300

  search = document.getElementById('search-form')
  search.removeAttribute('disabled')
  search.setAttribute('placeholder', 'Chercher...')
  results = document.getElementById('results')

  search.addEventListener('keyup', function () {
    clearTimeout(typingTimer)
    typingTimer = setTimeout(doneTyping, doneTypingInterval)
  })

  search.addEventListener('keydown', function () {
    clearTimeout(typingTimer)
  })
  function doneTyping () {
    let which = current_mode
    if (search.value == '') {
      reset(which)
    } else if (search.value != current_search_value) {
      if (which == 'topics') {
        filter_topics(search.value)
      } else if (which == 'voc') {
        filter_voc(search.value)
      }
    }
  }
}

function is_hidden (div) {
  return div['style']['display'] == 'none'
}

function hide (item) {
  // invisible utility leaves a fat white patch
  // item.classList.add('invisible')
  item.setAttribute('style', 'display:none !important;')
}
function unhide (item) {
  // item.classList.remove('invisible')
  item.removeAttribute('style')
}

function set_back_btn () {
  let retour_btn = document.getElementById('back-btn')
  retour_btn.addEventListener('click', () => {
    reset_topics()
    reset_search_value()
  })
}

function set_apropos_btn () {
  let apropos_btn = document.getElementById('a-propos-btn')
  let apropos = document.getElementById('a-propos')
  let content = document.getElementById('content')

  apropos_btn.addEventListener('click', () => {
    if (is_hidden(apropos) && !is_hidden(content)) {
      // show apropos
      unhide(apropos)
      hide(content)
      apropos_btn.innerHTML = 'Retour'
    } else if (!is_hidden(apropos) && is_hidden(content)) {
      // hide apropos
      unhide(content)
      hide(apropos)
      apropos_btn.innerHTML = 'À propos'
    } else {
      // in case reset to hide apropos
      unhide(content)
      hide(apropos)
      apropos_btn.innerHTML = 'À propos'
    }
  })
}

function setup_select () {
  var sel = document.getElementById('sem-select')
  for (let ii = 0; ii < SEM_OPTIONS.length; ii++) {
    var opt = document.createElement('option')
    opt.value = SEM_OPTIONS[ii]
    opt.innerHTML = SEM_OPTIONS[ii]
    sel.appendChild(opt)
  }
  sel.addEventListener('change', function () {
    if (WHICH != sel.value) {
      WHICH = sel.value
      main()
    }
  })
}

function empty_all () {
  let topic_list = document.getElementById('topic-list')
  topic_list.innerHTML = ''
  let voc_items = document.getElementById('voc-items')
  voc_items.innerHTML = ''
}

function main () {
  empty_all()
  load_and_show_list()
  set_apropos_btn()
  set_back_btn()
}

document.addEventListener('DOMContentLoaded', event => {
  setup_select()
  main()
})
