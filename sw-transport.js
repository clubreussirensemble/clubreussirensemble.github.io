<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw-transport.js').catch(e => console.log('SW erreur', e));
  });
}
</script>
