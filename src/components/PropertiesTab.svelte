<script lang="ts">
  import Accordion from 'carbon-components-svelte/src/Accordion/Accordion.svelte';
  import AccordionItem from 'carbon-components-svelte/src/Accordion/AccordionItem.svelte';
  import MultiSelect from 'carbon-components-svelte/src/MultiSelect/MultiSelect.svelte';
  import Select from 'carbon-components-svelte/src/Select/Select.svelte';
  import SelectItem from 'carbon-components-svelte/src/Select/SelectItem.svelte';

  import Checkbox from 'carbon-components-svelte/src/Checkbox/Checkbox.svelte';
  // import NumberInput from 'carbon-components-svelte/src/NumberInput/NumberInput.svelte';
  // import TextInput from 'carbon-components-svelte/src/TextInput/TextInput.svelte';

  import { getContext } from 'svelte';
  let customisation = getContext<any>('customisation');
  let inflationData = getContext<any>('inflation-data');

  $: allGroups = Object.keys($inflationData);
  $: allSubGroups = Object.values($inflationData).reduce(
    (acc: string[], group: any) => [...acc, ...Object.keys(group)],
    []
  );
</script>

<div>
  <Accordion>
    <AccordionItem title="Data" open>
      <Select
        labelText="Income source"
        bind:selected={$customisation.index}
      >
        <SelectItem value="employed" text="Salary / Wages" />
        <SelectItem value="agepension" text="Age Pension" />
        <SelectItem value="othergovt" text="Other Govt Payments" />
        <SelectItem value="superannuation" text="Self-funded Retiree" />
        <SelectItem value="cpi" text="Consumer Price Index (CPI)" />
      </Select>

      <Select
        labelText="Inflation years"
        bind:selected={$customisation.timelineYears}
      >
        <SelectItem value="1" text="1 year" />
        <SelectItem value="10" text="10 years" />
      </Select>

      <MultiSelect
        titleText="Split groups"
        bind:selectedIds={$customisation.splitGroups}
        items={allGroups.map(g => ({ id: g, text: g }))}
      />

      <MultiSelect
        titleText="Removed groups"
        bind:selectedIds={$customisation.removedGroups}
        items={allSubGroups.map(g => ({ id: g, text: g }))}
      />

      <Checkbox
        labelText="Expand inflation (x-axis)"
        bind:checked={$customisation.expandInflation}
      />
      <Checkbox
        labelText="Show discretionary vs non-discretionary"
        bind:checked={$customisation.showDiscretionary}
      />

    </AccordionItem>

  </Accordion>
</div>

<style>
  :global(.bx--accordion__title) {
    font-weight: bold;
  }

  :global(.bx--checkbox-wrapper) {
    flex-direction: row;
    margin-bottom: 0.5rem;
  }

  :global(.bx--multi-select__wrapper) {
    margin-bottom: 1rem;
  }

  :global(.bx--text-input-wrapper) {
    margin-bottom: 1rem;
  }

  :global(.bx--checkbox-label) {
    margin-left: 0.5rem;
  }

  :global(.bx--tile) {
    margin-bottom: 1rem;
  }

  :global(.bx--select) {
    margin-bottom: 1rem;
  }

  :global(.bx--number) {
    margin-bottom: 1rem;
  }
</style>
