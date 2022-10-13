<script lang="ts">
  import SvelteSelect from 'svelte-select';

  export let isDisabled = false;
  export let isClearable = true;
  export let items: any[];
  export let onSelect = () => ({});
</script>

<SvelteSelect
  containerClasses="abcnews-select"
  on:select={onSelect}
  {isDisabled}
  {isClearable}
  {items}
/>

<style lang="scss">
  .abcnews-select {
    padding: 0.8rem;
    font-family: 'ABCSans';

    .label {
      display: inline-block;
      margin: 0 0 0.8rem;
      font-weight: bold;
    }

    --tint-3: hsl(0, 0%, 60%);
    --tint-4: hsl(0, 0%, 80%);
    --tint-5: hsl(0, 0%, 90%);
    --tint-6: hsl(0, 0%, 95%);

    --height: 50px;
    --padding: 0.75rem 2.5rem 0.6rem 1rem;
    --inputFontSize: 1rem;
    --optionFontSize: 0.875rem;
    --borderRadius: 0;
    --inputLetterSpacing: normal;

    --border: 1px solid var(--tint-4);
    --borderFocusColor: var(--tint-3);
    --itemIsActiveBG: var(--tint-6);
    --itemIsActiveColor: rgb(0, 88, 204);

    --itemHoverBG: var(--itemIsActiveColor);
    --itemHoverColor: white;
    --itemFirstBorderRadius: 0;
    --listBorderRadius: 0;

    :global(.selectContainer.focused) {
      border-left-width: 0.5rem;
      border-color: var(--tint-3);
      transition: border-width 0.2s ease-out;
    }

    :global(input) {
      cursor: pointer !important;
      font-family: 'ABCSans';
    }

    :global(.item) {
      font-size: var(--optionFontSize);
      cursor: pointer;

      &:hover, &:active {
        background: var(--itemHoverBG, #e7f2ff);
        color: var(--itemHoverColor, inherit);
      }
    }
    :global(.item.active) {
      border-left: 8px solid var(--itemIsActiveColor);
    }
  }
</style>
