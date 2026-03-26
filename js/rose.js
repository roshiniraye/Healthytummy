let roseProducts = [];

function toggleChat() {
  const box = document.getElementById("rose-box");
  box.style.display = box.style.display === "block" ? "none" : "block";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("rose-toggle").onclick = toggleChat;
  loadRose();
});

async function loadRose() {
  let res = await fetch("/api/products");
  roseProducts = await res.json();

  showRoseMessage("Hi, I'm Rose 🌹! What would you like?");
  showCategories();
}

function showRoseMessage(text) {
  const body = document.getElementById("rose-body");
  body.innerHTML += `<div class="rose-msg">${text}</div>`;
}

function showRoseButtons(options) {
  const body = document.getElementById("rose-body");

  options.forEach(opt => {
    body.innerHTML += `<button class="rose-btn" onclick="${opt.action}">${opt.text}</button>`;
  });

  body.scrollTop = body.scrollHeight;
}

function showCategories() {
  let categories = [...new Set(roseProducts.map(p => p.category))];

  showRoseMessage("Choose a category:");

  showRoseButtons(
    categories.map(c => ({
      text: c,
      action: `roseProductsByCategory('${c}')`
    }))
  );
}

function roseProductsByCategory(category) {
  document.getElementById("rose-body").innerHTML = "";

  let list = roseProducts.filter(p => p.category === category);

  showRoseMessage(`Products in ${category}:`);

  showRoseButtons(
    list.map(p => ({
      text: p.name,
      action: `roseSelectProduct(${p.id})`
    }))
  );
}

function roseSelectProduct(id) {
  document.getElementById("rose-body").innerHTML = "";

  let p = roseProducts.find(x => x.id === id);

  showRoseMessage(`You selected ${p.name}`);

  showRoseButtons([
    { text: "Benefits", action: `roseBenefits(${id})` },
    { text: "Price", action: `rosePrice(${id})` },
    { text: "Add to Cart", action: `roseAddCart(${id})` }
  ]);
}

function roseBenefits(id) {
  let p = roseProducts.find(x => x.id === id);
  showRoseMessage("Benefits: " + p.benefits);
}

function rosePrice(id) {
  let p = roseProducts.find(x => x.id === id);
  showRoseMessage("Price: ₹" + p.price);
}

function roseAddCart(id) {
  let cart = JSON.parse(localStorage.getItem("healthytummy_cart")) || [];

  let p = roseProducts.find(x => x.id === id);

  let item = cart.find(i => i.id === id);

  if (item) item.quantity++;
  else cart.push({ id: p.id, quantity: 1 });

  localStorage.setItem("healthytummy_cart", JSON.stringify(cart));

  showRoseMessage("Added to cart 🛒");

  showRoseButtons([
    { text: "Add More", action: "restartRose()" },
    { text: "Checkout", action: "goCheckout()" }
  ]);
}

function restartRose() {
  document.getElementById("rose-body").innerHTML = "";
  showCategories();
}

function goCheckout() {
  window.location.href = "cart.html";
}