const { createApp, ref, onMounted, watch } = Vue;
const { createRouter, createWebHashHistory, useRoute } = VueRouter;

function detectParamType(value) {
  if (value === undefined || value === null) return value;
  if (value === '') return value;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;
  return decodeURIComponent(value);
}

function buildParamsFromRest(rest) {
  let segments = [];

  if (Array.isArray(rest)) {
    segments = rest;
  } else if (typeof rest === 'string' && rest.length > 0) {
    segments = rest.split('/').filter(Boolean);
  }

  const params = {};
  for (let i = 0; i < segments.length; i++) {
    params[`param${i + 1}`] = detectParamType(segments[i]);
  }
  return params;
}

const PageLoader = {
  name: 'PageLoader',
  props: {
    htmlPath: { type: String, required: true },
    jsPath: { type: String, default: null },
    title: { type: String, default: '' }
  },
  setup(props) {
    const route = useRoute();
    const containerRef = ref(null);
    const loading = ref(false);
    const error = ref('');

    const load = async () => {
      loading.value = true;
      error.value = '';

      if (props.title) {
        document.title = props.title;
      }

      try {
        const resp = await fetch(props.htmlPath);
        if (!resp.ok) throw new Error(`HTTP ${resp.status} loading ${props.htmlPath}`);
        const html = await resp.text();

        if (containerRef.value) {
          containerRef.value.innerHTML = html;
        }

        const params = buildParamsFromRest(route.params.rest);
        window.routeParams = params;
        window.routeQuery = route.query || {};

        if (props.jsPath) {
          import(props.jsPath + `?v=${Date.now()}`)
            .then((module) => {
              if (module.init) module.init(params);
              else if (typeof module.default === 'function') module.default(params);
            })
            .catch((err) => console.warn('Script load failed:', err));
        }
      } catch (e) {
        error.value = e && e.message ? e.message : String(e);
        if (containerRef.value) {
          containerRef.value.innerHTML = '';
        }
      } finally {
        loading.value = false;
      }
    };

    onMounted(load);
    watch(() => route.fullPath, load);

    return { containerRef, loading, error };
  },
  template: `
    <div>
      <div v-if="loading" class="q-pa-lg flex flex-center">
        <q-spinner color="primary" size="3em" />
      </div>
      <div v-else-if="error" class="q-pa-md">
        <div class="text-h6 text-negative">Error Loading Page</div>
        <div class="q-mt-sm">{{ error }}</div>
      </div>
      <div v-else id="main-page" ref="containerRef"></div>
    </div>
  `
};

const App = {
  name: 'App',
  setup() {
    const leftDrawerOpen = ref(false);

    const closeDrawer = () => {
      leftDrawerOpen.value = false;
    };

    return { leftDrawerOpen, closeDrawer };
  },
  template: `
    <q-layout view="hHh lpR fFf">
      <q-header elevated class="bg-green-7 text-white">
        <q-toolbar>
          <q-btn dense flat round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
          <q-toolbar-title>
            GreenHarvest Agriculture
          </q-toolbar-title>
          <q-space />
          <q-btn flat label="Home" to="/" />
          <q-btn flat label="Services" to="/services" />
          <q-btn flat label="Products" to="/products" />
          <q-btn flat label="About" to="/about" />
          <q-btn flat label="Contact" to="/contact" />
        </q-toolbar>
      </q-header>

      <q-drawer v-model="leftDrawerOpen" side="left" overlay elevated>
        <q-list>
          <q-item-label header>Navigation</q-item-label>

          <q-item clickable v-ripple to="/" @click="closeDrawer">
            <q-item-section avatar><q-icon name="home" /></q-item-section>
            <q-item-section>Home</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/services" @click="closeDrawer">
            <q-item-section avatar><q-icon name="eco" /></q-item-section>
            <q-item-section>Services</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/products" @click="closeDrawer">
            <q-item-section avatar><q-icon name="shopping_cart" /></q-item-section>
            <q-item-section>Products</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/about" @click="closeDrawer">
            <q-item-section avatar><q-icon name="info" /></q-item-section>
            <q-item-section>About</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/contact" @click="closeDrawer">
            <q-item-section avatar><q-icon name="phone" /></q-item-section>
            <q-item-section>Contact</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/lorem" @click="closeDrawer">
            <q-item-section avatar><q-icon name="article" /></q-item-section>
            <q-item-section>Lorem</q-item-section>
          </q-item>
        </q-list>
      </q-drawer>

      <q-page-container>
        <q-page class="q-pa-md">
          <router-view />
        </q-page>
      </q-page-container>
    </q-layout>
  `
};

const routes = [
  {
    path: '/',
    component: PageLoader,
    props: { htmlPath: '/pages/index.html', jsPath: '/js/index.js', title: 'Home' }
  },
  {
    path: '/services/:rest(.*)*',
    component: PageLoader,
    props: { htmlPath: '/pages/services.html', jsPath: '/js/services.js', title: 'Services' }
  },
  {
    path: '/products/:rest(.*)*',
    component: PageLoader,
    props: { htmlPath: '/pages/products.html', jsPath: '/js/products.js', title: 'Products' }
  },
  {
    path: '/about/:rest(.*)*',
    component: PageLoader,
    props: { htmlPath: '/pages/about.html', jsPath: '/js/about.js', title: 'About' }
  },
  {
    path: '/contact/:rest(.*)*',
    component: PageLoader,
    props: { htmlPath: '/pages/contact.html', jsPath: '/js/contact.js', title: 'Contact' }
  },
  {
    path: '/lorem/:rest(.*)*',
    component: PageLoader,
    props: { htmlPath: '/pages/lorem.html', jsPath: '/js/lorem.js', title: 'Lorem' }
  },
  {
    path: '/:pathMatch(.*)*',
    component: PageLoader,
    props: { htmlPath: '/pages/404.html', jsPath: null, title: '404' }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

const app = createApp(App);
app.use(router);
app.use(Quasar);
Quasar.IconSet.set(Quasar.IconSet.svgMaterialIcons);
app.mount('#q-app');
