<script lang="ts">
  const absolutePath = __webpack_public_path__ || '/';

  let width: number;
  $: src = width > 450 ? 'header-img-desktop@2x.png' : 'header-img-mobile@2x.png';

  document.querySelector('#headerimg')?.classList.add('u-full');
</script>

<div
  bind:clientWidth={width}
  class="header-img"
  style="background-image: url({absolutePath}{src})"
  alt="Illustrated icons of everyday objects including an apple, a calculator and a wine bottle."
/>

<style lang="scss">
  :global(#headerimg) {
    position: relative;
    height: 168px;
  }
  .header-img {
    width: 100vw;
    height: 168px;
    background-repeat: repeat-x;
    background-size: contain;
    left: 0;
    position: absolute;
  }

  @media only screen and (max-width: 450px) {
    :global(#headerimg) {
      height: calc(50vw);
    }

    .header-img {
      background-repeat: no-repeat;
      background-size: cover;
      position: static;
      height: calc(50vw);
    }
  }
</style>
