<script lang="ts">
  const absolutePath = __webpack_public_path__ || '/';

  export let heading: string;

  $: src = `${absolutePath}${heading}@2x.png`;
</script>

<div
  class="subheader-img"
  style="background-image: url({src})"
  alt="Illustrated icons of everyday objects ."
/>

<style lang="scss">
  .subheader-img {
    width: 330px;
    max-width: 75vw;
    aspect-ratio: 266 / 48;
    margin: auto;
    background-size: contain;
  }

  :global(#subhead-1, #subhead-2, #subhead-3) {
    height: 0px;
  }
  :global(#subhead-1) {
    margin-top: 40px;
  }
  :global(#subhead-2, #subhead-3) {
    margin-top: -40px;
  }
  @media only screen and (max-width: 700px) {
    :global(#subhead-1, #subhead-2, #subhead-3) {
      height: 25px;
    }
  }

  :global(#subhead-1 ~ h2::before) {
    height: 0;
    background-color: none;
  }

</style>
