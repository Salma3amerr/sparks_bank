// Function to check if an element is in the viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Function to add the active class to elements in the viewport
function addActiveClass() {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((element) => {
        if (isInViewport(element)) {
            element.classList.add('active');
        }
    });
}

// Add an event listener to check for elements in the viewport on scroll
window.addEventListener('scroll', addActiveClass);

