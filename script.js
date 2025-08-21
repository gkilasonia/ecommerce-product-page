document.addEventListener("DOMContentLoaded", function () {
  // --- DOM ELEMENTS ---
  const menuBtn = document.getElementById("menuButton");
  const menu = document.getElementById("menuContainer");
  const closeBtn = document.getElementById("closeButton");
  const cartButton = document.querySelector(".cart-button");
  const cartAside = document.querySelector(".cart-items");
  const minusBtn = document.getElementById("minusButton");
  const plusBtn = document.getElementById("plusButton");
  const quantitySpan = document.getElementById("quantityNumber");
  const mainImage = document.querySelector(".main-product-image");
  const thumbnailButtons = document.querySelectorAll(".thumbnails-button");
  const thumbnails = document.querySelectorAll(".thumbnails");
  const addToCartBtn = document.querySelector(".add-to-cart-button");
  const cartEmpty = document.querySelector(".cart-empty");
  const cartItemsQuantity = document.querySelector(".cart-items-quantity");
  const mainProductTitle = document.querySelector(".product-title");
  const carousel = document.getElementById("carousel");
  const carouselOverlay = document.getElementById("carouselOverlay");
  const mainProductImageButton = document.getElementById(
    "mainProductImageButton"
  );
  const carouselCloseButton = document.getElementById("carouselCloseButton");
  let quantity = parseInt(quantitySpan.textContent, 10);

  // --- CART STATE ---
  let cart = [];

  // --- FUNCTIONS ---
  function getActiveCarouselImage() {
    const activeItem = carousel
      ? carousel.querySelector(".carousel-item.active")
      : null;
    if (activeItem) {
      const img = activeItem.querySelector("img");
      if (img) {
        return {
          id: img.getAttribute("src"),
          thumbnail: img.getAttribute("src").replace(".jpg", "-thumbnail.jpg"),
          alt: img.getAttribute("alt"),
        };
      }
    }
    if (mainImage) {
      return {
        id: mainImage.getAttribute("src"),
        thumbnail: mainImage
          .getAttribute("src")
          .replace(".jpg", "-thumbnail.jpg"),
        alt: mainImage.getAttribute("alt"),
      };
    }
    return null;
  }

  function renderCart() {
    // Remove all existing cart-item elements
    cartAside.querySelectorAll(".cart-item").forEach((item) => item.remove());
    // Remove existing checkout/footer if present
    const oldFooter = cartAside.querySelector(".cart-footer");
    if (oldFooter) oldFooter.remove();

    let totalQuantity = 0;
    let totalPrice = 0;

    cart.forEach((item) => {
      totalQuantity += item.quantity;
      totalPrice += item.price * item.quantity;

      // Create cart item element
      const cartItem = document.createElement("div");
      cartItem.className = "cart-item";
      cartItem.style.display = "flex";
      cartItem.setAttribute("aria-live", "polite");

      cartItem.innerHTML = `
        <div class="cart-item-details" role="listitem">
          <img
            class="cart-item-image"
            src="${item.thumbnail}"
            alt="${item.title} thumbnail"
          />
          <div class="cart-item-text-container">
            <span class="cart-item-title">${item.title}</span>
            <span>
              $${item.price.toFixed(2)} x <span>${item.quantity}</span>
              <span class="cart-item-total-price">$${(
                item.price * item.quantity
              ).toFixed(2)}</span>
            </span>
          </div>
          <button class="remove-item-button" aria-label="Remove item from cart">
            <img src="./images/icon-delete.svg" alt="Remove item from cart" />
          </button>
        </div>
      `;

      cartItem
        .querySelector(".remove-item-button")
        .addEventListener("click", function () {
          cart = cart.filter((ci) => ci.id !== item.id);
          renderCart();
        });

      cartAside.appendChild(cartItem);
    });

    // Update cart badge and empty message
    if (cart.length === 0) {
      cartEmpty.style.display = "";
      cartItemsQuantity.style.display = "none";
    } else {
      cartEmpty.style.display = "none";
      cartItemsQuantity.style.display = "inline-block";
      cartItemsQuantity.textContent = totalQuantity;

      // Add a single checkout button and total price
      const cartFooter = document.createElement("div");
      cartFooter.className = "cart-footer";
      cartFooter.style.display = "flex";
      cartFooter.style.flexDirection = "column";
      cartFooter.style.gap = "12px";
      cartFooter.innerHTML = `
        <div class="cart-total" style="text-align:right;font-weight:bold;">
          Total: $${totalPrice.toFixed(2)}
        </div>
        <button class="checkout-button" aria-label="Checkout all items">Checkout</button>
      `;
      cartAside.appendChild(cartFooter);
    }
  }

  // --- EVENT LISTENERS ---

  // Menu open/close
  if (menuBtn && menu && closeBtn) {
    menuBtn.addEventListener("click", function () {
      menu.style.display = "flex";
      menu.removeAttribute("aria-hidden");
      closeBtn.focus();
    });
    closeBtn.addEventListener("click", function () {
      menu.style.display = "none";
      menu.setAttribute("aria-hidden", "true");
      menuBtn.focus();
    });
  }

  // Cart open/close
  if (cartButton && cartAside) {
    cartButton.addEventListener("click", function () {
      cartAside.style.display =
        cartAside.style.display === "flex" ? "none" : "flex";
    });
  }

  // Carousel controls
  if (carousel) {
    const items = carousel.querySelectorAll(".carousel-item");
    const prevBtn = carousel.querySelector(".carousel-control-prev");
    const nextBtn = carousel.querySelector(".carousel-control-next");
    let current = Array.from(items).findIndex((item) =>
      item.classList.contains("active")
    );

    function showSlide(index) {
      items[current].classList.remove("active");
      current = (index + items.length) % items.length;
      items[current].classList.add("active");
    }

    if (prevBtn)
      prevBtn.addEventListener("click", () => showSlide(current - 1));
    if (nextBtn)
      nextBtn.addEventListener("click", () => showSlide(current + 1));
  }

  // Quantity controls
  if (minusBtn && plusBtn && quantitySpan) {
    minusBtn.addEventListener("click", function () {
      if (quantity > 1) {
        quantity--;
        quantitySpan.textContent = quantity;
      }
    });
    plusBtn.addEventListener("click", function () {
      quantity++;
      quantitySpan.textContent = quantity;
    });
  }

  // Thumbnails
  thumbnailButtons.forEach((button) => {
    button.addEventListener("click", function () {
      thumbnails.forEach((img) => img.classList.remove("selected"));
      const thumbImg = button.querySelector(".thumbnails");
      if (thumbImg) thumbImg.classList.add("selected");
      const thumbSrc = thumbImg.getAttribute("src");
      const match = thumbSrc.match(/image-product-(\d)-thumbnail\.jpg$/);
      if (match) {
        const num = match[1];
        mainImage.setAttribute("src", `./images/image-product-${num}.jpg`);
        mainImage.setAttribute("alt", `Sneakers main view ${num}`);
      }
    });
  });

  // Add to cart (always uses active image, from carousel or main)
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function () {
      const qty = parseInt(quantitySpan.textContent, 10);
      if (qty <= 0) return;
      const activeImage = getActiveCarouselImage();
      if (!activeImage) return;
      const title = mainProductTitle ? mainProductTitle.textContent : "Product";
      const price = 125; // Update if dynamic

      const existing = cart.find((item) => item.id === activeImage.id);
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.push({
          id: activeImage.id,
          title,
          price,
          quantity: qty,
          thumbnail: activeImage.thumbnail,
        });
      }
      renderCart();
    });
  }

  // Carousel modal open/close
  if (mainProductImageButton && carousel && carouselOverlay) {
    mainProductImageButton.addEventListener("click", function () {
      carousel.style.display = "flex";
      carouselOverlay.hidden = false;
      if (carouselCloseButton) {
        carouselCloseButton.style.display = "block";
        carouselCloseButton.disabled = false;
        carouselCloseButton.focus();
      }
    });
  }
  if (carouselCloseButton && carousel && carouselOverlay) {
    carouselCloseButton.addEventListener("click", function () {
      carousel.style.display = "none";
      carouselOverlay.hidden = true;
      carouselCloseButton.style.display = "none";
      if (mainProductImageButton) {
        mainProductImageButton.focus();
      }
    });
  }

  // --- INITIAL RENDER ---
  renderCart();
});
