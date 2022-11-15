<script lang="ts">
  export let disabled = false;
  export let selected: string = '';
  export let items: { value: string, label: string }[];
  export let onClick = (value: string, _: number) => value;
</script>

<div class:disabled={disabled} class="button-group">
  {#each items as item, i}
    <button
      class="button"
      class:active={selected === item.value}
      on:click={onClick}
      on:click={() => onClick(item.value, i)}
    >
      {item.label.toUpperCase()}
    </button>
  {/each}
</div>

<style lang="scss">
  .button-group {
    display: flex;
    width: 100%;

    &.disabled {
      cursor: none;
    }

    .button {
      flex: 1;

      font-family: 'ABCSans';
      color: black;
      display: inline-block;
      background: transparent;
      font-size: 0.875rem;
      font-weight: bold;
      height: 48px;
      margin: 0;
      text-align: center;
      vertical-align: middle;
      cursor: pointer;
      border: 1px solid;
      border-color: rgba(0, 0, 0, 0.6);
      transition: var(--dls-link-transition);
      touch-action: manipulation;

      &.active {
        background: rgba(217, 217, 217, 1);
      }

      border-radius: 0;
      &:first-child {
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
      }
      &:last-child {
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
      }
      &:not(last-child){
        margin-left: -1px;
      }
    }
  }
</style>
