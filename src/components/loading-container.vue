<template>
  <div class="fillheight">
    <div class="fillheight loading-container" v-show="loading">
      <loading />
    </div>
    <div v-show="!loading" class="fillheight" :class="classContainer">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    location: { type: String, required: true },
    classContainer: { type: String, default: "" },
  },
  data: () => ({ loading: false, id: "" }),
  computed: {},
  created() {
    this.id = `${this.location}-${this._uid}`;
    this.$store.commit("loading/addRouteLoadingHandle", {
      id: this.id,
      handle: (value) => this.setLoading(value),
    });
  },
  beforeDestroy() {
    this.$store.commit("loading/removeRouteLoadingHandle", {
      id: this.id,
    });
  },
  methods: {
    setLoading(loading) {
      this.loading = loading;
    },
  },
};
</script>

<style scoped></style>
