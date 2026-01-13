const app = Vue.createApp({
  setup () {
    const { ref } = Vue;

    const leftDrawerOpen = ref(false);

    const nav = (hashPath) => {
      const path = hashPath.startsWith('#') ? hashPath.slice(1) : hashPath;
      if (typeof window.navigateTo === 'function') {
        window.navigateTo(path);
      } else {
        window.location.hash = path;
      }
      leftDrawerOpen.value = false;
    };

    return {
      leftDrawerOpen,
      nav
    };
  },
  template: `
    <q-layout view="hHh lpR fFf">
      <q-header elevated class="bg-green-7 text-white">
        <q-toolbar>
          <q-btn dense flat round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
          <q-toolbar-title class="cursor-pointer" @click="nav('/')">
            <q-avatar>
              <q-icon name="agriculture" />
            </q-avatar>
            GreenHarvest Agriculture
          </q-toolbar-title>
          <q-space />
          <q-btn flat label="Home" @click="nav('/')" />
          <q-btn flat label="Services" @click="nav('/services')" />
          <q-btn flat label="Products" @click="nav('/products')" />
          <q-btn flat label="About" @click="nav('/about')" />
          <q-btn flat label="Contact" @click="nav('/contact')" />
        </q-toolbar>
      </q-header>

      <q-drawer v-model="leftDrawerOpen" side="left" overlay elevated>
        <q-list>
          <q-item-label header>Navigation</q-item-label>

          <q-item clickable v-ripple @click="nav('/')">
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>Home</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="nav('/services')">
            <q-item-section avatar>
              <q-icon name="eco" />
            </q-item-section>
            <q-item-section>Services</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="nav('/products')">
            <q-item-section avatar>
              <q-icon name="shopping_cart" />
            </q-item-section>
            <q-item-section>Products</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="nav('/about')">
            <q-item-section avatar>
              <q-icon name="info" />
            </q-item-section>
            <q-item-section>About</q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="nav('/contact')">
            <q-item-section avatar>
              <q-icon name="phone" />
            </q-item-section>
            <q-item-section>Contact</q-item-section>
          </q-item>
        </q-list>
      </q-drawer>

      <q-page-container>
        <q-page class="q-pa-md">
          <div id="main-page"></div>
        </q-page>
      </q-page-container>
    </q-layout>
  `
});

app.use(Quasar);
Quasar.IconSet.set(Quasar.IconSet.svgMaterialIcons);

app.mount('#q-app');
