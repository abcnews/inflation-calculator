<script lang="ts">
  // import { Decimal } from 'decimal.js-light';
  import Accordion from 'carbon-components-svelte/src/Accordion/Accordion.svelte';
  import AccordionItem from 'carbon-components-svelte/src/Accordion/AccordionItem.svelte';
  import MultiSelect from 'carbon-components-svelte/src/MultiSelect/MultiSelect.svelte';
  import Select from 'carbon-components-svelte/src/Select/Select.svelte';
  import SelectItem from 'carbon-components-svelte/src/Select/SelectItem.svelte';

  // import Slider from 'carbon-components-svelte/src/Slider/Slider.svelte';
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
      <!-- <Select -->
      <!--   labelText="Income source" -->
      <!--   bind:selected={$customisation.index} -->
      <!-- > -->
      <!--   <SelectItem value="employed" text="Salary / Wages" /> -->
      <!--   <SelectItem value="agepension" text="Age Pension" /> -->
      <!--   <SelectItem value="othergovt" text="Other Govt Payments" /> -->
      <!--   <SelectItem value="superannuation" text="Self-funded Retiree" /> -->
      <!--   <SelectItem value="cpi" text="Consumer Price Index (CPI)" /> -->
      <!-- </Select> -->

      <Select
        labelText="Housing type"
        bind:selected={$customisation.housingProfile}
      >
        <SelectItem value="null" text="None" />
        <SelectItem value="renter" text="Rent" />
        <SelectItem value="mortgage" text="Owner with mortgage" />
        <SelectItem value="outright" text="Own outright" />
      </Select>


      <Select
        labelText="Inflation years"
        bind:selected={$customisation.timelineYears}
      >
        <SelectItem value="1" text="1 year" />
        <SelectItem value="10" text="10 years" />
      </Select>

      <!-- <Select -->
      <!--   labelText="Colour Bars By" -->
      <!--   bind:selected={$customisation.colourBy} -->
      <!-- > -->
      <!--   <SelectItem value="category" text="Category" /> -->
      <!--   <SelectItem value="discretionary" text="Discretionary" /> -->
      <!-- </Select> -->

      <Select
        labelText="Order Bars By"
        bind:selected={$customisation.orderBy}
      >
        <SelectItem value="area" text="Area" />
        <SelectItem value="inflation" text="Inflation" />
        <SelectItem value="weighting" text="Weighting" />
        <SelectItem value="category" text="Category" />
        <SelectItem value="discretionary" text="Discretionary" />
        <SelectItem value="default" text="Default" />
      </Select>

      <MultiSelect
        titleText="Split groups"
        filterable
        bind:selectedIds={$customisation.splitGroups}
        items={allGroups.map(g => ({ id: g, text: g }))}
      />

      <MultiSelect
        titleText="Zoomed in groups"
        filterable
        bind:selectedIds={$customisation.zoomedInGroups}
        items={allGroups.map(g => ({ id: g, text: g }))}
      />

      <MultiSelect
        titleText="Removed groups"
        filterable
        bind:selectedIds={$customisation.removedGroups}
        items={allSubGroups.map(g => ({ id: g, text: g }))}
      />

      <MultiSelect
        titleText="Highlighted groups"
        filterable
        bind:selectedIds={$customisation.highlightedGroups}
        items={['Discretionary', 'Non Discretionary', ...allGroups, ...allSubGroups].map(g => ({ id: g, text: g }))}
      />

      <Checkbox
        labelText="Apply Personalisation (this makes the quiz influence it inside the story)"
        bind:checked={$customisation.applyPersonalisation}
      />
      <Checkbox
        labelText="Force housing profile"
        bind:checked={$customisation.forceHousingProfile}
      />
      <Checkbox
        labelText="Prevent zoom splitting"
        bind:checked={$customisation.preventZoomSplitting}
      />
      <Checkbox
        labelText="Show Marimako"
        bind:checked={$customisation.showMarimako}
      />
      <!-- <Checkbox -->
      <!--   labelText="Show Inflation Breakdown" -->
      <!--   bind:checked={$customisation.showInflationBreakdown} -->
      <!-- /> -->

    </AccordionItem>

  </Accordion>
</div>
