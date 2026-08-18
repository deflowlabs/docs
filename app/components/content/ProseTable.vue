<template>
  <!-- Keep native table semantics while exposing horizontal overflow to keyboard users. -->
  <div class="my-6 overflow-x-auto rounded-lg border border-(--ui-border)" role="region" aria-label="Scrollable data table" tabindex="0">
    <table class="m-0 min-w-168 border-0"><slot /></table>
  </div>
</template>
