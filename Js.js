"use strict"; // Use strict mode for better error checking and debugging

// DOM Declarations
const openMenuButtonEl = document.getElementById("open-menu");
const closeMenuButtonEl = document.getElementById("close-menu");
const navMenuEl = document.getElementById("nav-menu");
const submitButton = document.getElementById("submit-review");
const reviewerName = document.getElementById("reviewer-name");
const reviewText = document.getElementById("review-text");
const starRatingContainer = document.getElementById("star-rating");
const returnToTopButton = document.getElementById("return-to-top");
let selectedRating = 0;


// fade in anim. with observer

document.addEventListener("DOMContentLoaded", () => {
  const observerOptions = {
    root: null, // Use the viewport as the root
    threshold: 0.3, // Trigger when 30% of the section is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Trigger fade-in animation only if it hasn't already triggered this time
        entry.target.classList.add("visible");

        // For cascading items (if they exist within the section)
        if (entry.target.classList.contains("cascade")) {
          const items = entry.target.querySelectorAll(".cascade-item");
          items.forEach((item, index) => {
            setTimeout(() => {
              item.style.opacity = 1;
              item.style.transform = "translateY(0)";
            }, index * 200); // Add delay for cascading effect
          });
        }
      } else {
        // Optionally, remove the "visible" class when section leaves the viewport,
        // so the animation can trigger again the next time the section is scrolled into view.
        entry.target.classList.remove("visible");

        // Reset cascade items if needed
        if (entry.target.classList.contains("cascade")) {
          const items = entry.target.querySelectorAll(".cascade-item");
          items.forEach((item) => {
            item.style.opacity = 0;
            item.style.transform = "translateY(50px)"; // Reset position if necessary
          });
        }
      }
    });
  }, observerOptions);

  // Attach observer to all sections or elements
  document.querySelectorAll(".fade-in, .cascade").forEach((section) => {
    observer.observe(section);
  });
});



document.addEventListener("DOMContentLoaded", () => {
  // **Progress Bar**
  const progressBar = document.getElementById("progress-bar");

  function updateProgressBar() {
    const scrollPosition = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollPercentage =
      (scrollPosition / (documentHeight - windowHeight)) * 100;
    progressBar.style.width = `${scrollPercentage}%`;
  }

  window.addEventListener("scroll", updateProgressBar);

  // **Menu Toggle**
  
// Our opening sequence
openMenuButtonEl.addEventListener('click', () => {
  // First, ensure the menu is visible
  navMenuEl.style.display = 'block';

  // Reset animations and trigger them again
  navMenuEl.classList.remove('active'); // Remove the active class to reset animation
  void navMenuEl.offsetHeight; // Trigger reflow (this forces the reset of animation)
  
  // Then trigger our animations
  requestAnimationFrame(() => {
    navMenuEl.classList.add('active');
  });
});

// Our closing sequence
closeMenuButtonEl.addEventListener('click', () => {
  navMenuEl.classList.remove('active');
  
  // Wait for animation to complete before hiding
  setTimeout(() => {
    navMenuEl.style.display = 'none';
    
    // Reset our menu items to their initial state
    // This is like resetting our actors to their starting positions
    const menuItems = navMenuEl.querySelectorAll('ul li');
    menuItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(30px)';
    });
    
    // Force a reflow to ensure our reset takes effect
    void navMenuEl.offsetHeight;
    
    // Reset our menu items to be controlled by CSS again
    menuItems.forEach(item => {
        item.style.opacity = '';
        item.style.transform = '';
    });
  }, 500); // Adjust timeout if needed
});


  // **Event Delegation for Navigation Links**
  navMenuEl?.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
      navMenuEl.style.display = "none";
    }
  });

  // **Return to Top Button**
  if (returnToTopButton) {
    window.addEventListener("scroll", function () {
      const scrollPosition = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollPercentage =
        (scrollPosition / (documentHeight - windowHeight)) * 100;

      returnToTopButton.style.display =
        scrollPercentage >= 90 ? "block" : "none";
    });

    returnToTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    
      // Optional: Add a slight delay to avoid any page jumps caused by layout changes
      setTimeout(() => {
        // Additional actions can be placed here if needed
      }, 500); // Adjust delay time if necessary
    });
  };    

  // **Star Rating**
  function updateStarSelection() {
    const stars = starRatingContainer?.querySelectorAll(".star");
    stars?.forEach((star) => {
      if (parseInt(star.getAttribute("data-value")) <= selectedRating) {
        star.classList.add("selected");
      } else {
        star.classList.remove("selected");
      }
    });
  }

  starRatingContainer?.addEventListener("click", (event) => {
    if (event.target.classList.contains("star")) {
      selectedRating = parseInt(event.target.getAttribute("data-value"));
      updateStarSelection();
    }
  });

  // **Submit Review**
  submitButton?.addEventListener("click", async () => {
    const name = reviewerName.value.trim();
    const review = reviewText.value.trim();

    if (name && review && selectedRating) {
      try {
        const response = await fetch("https://body-temple-reviews-production.up.railway.app/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, review, rating: selectedRating }),
        });

        if (response.ok) {
          window.location.href = "thanks.html";
        } else {
          alert("Failed to submit review. Please try again.");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        alert("An error occurred. Please try again.");
      }
    } else {
      alert("Please fill in all fields and select a rating!");
    }
  });

  // **Check if reviews-list exists**
  const reviewsList = document.getElementById("reviews-list");

  if (reviewsList) {
    // **Display Reviews Dynamically**
    function displayReviews(reviews) {
      reviewsList.innerHTML = ""; // Clear current reviews

      // Check if reviews is an array and has at least one review
      if (Array.isArray(reviews) && reviews.length === 0) {
        reviewsList.innerHTML = "<p>You can be the first to submit a review!</p>";
      } else if (Array.isArray(reviews) && reviews.length > 0) {
        // Loop through reviews and display each one
        reviews.forEach((review) => {
          const reviewItem = document.createElement("div");
          reviewItem.classList.add("review-item");

          const clubMemberLabel = review.subscribe
            ? '<p id="club">(Club Member)</p>'
            : "";

          reviewItem.innerHTML = `
            <div class="star-rating-display">${renderStars(review.rating)}</div>
            <p>${review.review}</p>
            <h4>${review.name}</h4>
            ${clubMemberLabel}
          `;
          reviewsList.appendChild(reviewItem);
        });
      }
    }

    // **Render Stars**
    function renderStars(rating) {
      let starsHTML = "";
      for (let i = 1; i <= 5; i++) {
        starsHTML += i <= rating ? "&#9733;" : "&#9734;"; // Filled or empty star
      }
      return starsHTML;
    }

    // **Fetch Reviews**
    async function fetchReviews() {
      try {
        const response = await fetch("https://body-temple-reviews-production.up.railway.app/reviews");
        const data = await response.json();

        // Check if 'reviews' exists and is an array before passing it to displayReviews
        if (data && Array.isArray(data.reviews)) {
          displayReviews(data.reviews);
        } else {
          console.error("Invalid reviews data:", data);
          displayReviews([]); // Display no reviews if the data is not valid
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        displayReviews([]); // Handle the case when there's an error fetching reviews
      }
    }

    // Fetch and Display Reviews
    fetchReviews();
  } else {
    console.log("Reviews list not found in the DOM.");
  }

  // Additional functionality for the carousel (if required)
  const upArrow = document.querySelector('.arrow-up'); // Adjust selector if needed
  const downArrow = document.querySelector('.arrow-down'); // Adjust selector if needed
  const reviewContainer = document.querySelector('.carousel-track-container');

  // Scroll up
  if (upArrow) {
    upArrow.addEventListener('click', () => {
      if (reviewContainer) {
        reviewContainer.scrollBy({
          top: -400, // Adjust the scroll amount
          behavior: 'smooth',
        });
      }
    });
  }

  // Scroll down
  if (downArrow) {
    downArrow.addEventListener('click', () => {
      if (reviewContainer) {
        reviewContainer.scrollBy({
          top: 400, // Adjust the scroll amount
          behavior: 'smooth',
        });
      }
    });
  }

  document.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('focus', (event) => {
      setTimeout(() => {
        event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300); // Delay to ensure keyboard is fully open
    });
  });
});

/*
document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', () => {
      document.querySelectorAll('.star').forEach(s => s.classList.remove('active'));
      star.classList.add('active');
  });
});
*/



// Guide Initialization  #1



document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements
  const guideIntro = document.getElementById("guide-intro");
  const decisionTree = document.querySelector(".guide-journey");  // Updated selector
  const resultsSection = document.getElementById("results");
  const startGuideButton = document.getElementById("start-guide");
  const questionElement = document.getElementById("question");
  const optionsContainer = document.querySelector(".options");  // Updated selector
  const recommendationElement = document.getElementById("massage-recommendation");

  

    // Add progress tracking
    const progressSteps = document.querySelectorAll('.progress-step');
    let currentStepIndex = 0;

    function updateProgress(stepName) {
        // Map step names to indices
        const stepIndices = {
            'start': 0,
            'intensity': 1,
            'duration': 2,
            'aromatherapy': 3,
            'final': 4
        };

        // Update progress visualization
        progressSteps.forEach((step, index) => {
            if (index <= stepIndices[stepName]) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
  

    // 🌟 Here's our missing steps definition #2
    const steps = {
      start: {
          question: "Which areas would you like to focus on?",
          options: {
              "🙇🏼‍♂️ Back": { next: "intensity", focus: "back" },
              "🦵 Legs": { next: "intensity", focus: "legs" },
              "🧍‍♂️ Full Body": { next: "intensity", focus: "full" },
              "👨🏼‍🦱 Face and Scalp": { next: "aromatherapy", focus: "face" }
          }
      },
      intensity: {
          question: "What type of pressure do you prefer?",
          options: {
              "🪶 Light to Medium": { next: "duration", intensity: "gentle" },
              "💪 Firm to Deep": { next: "duration", intensity: "deep" }
          }
      },
      duration: {
          question: "How long would you like your session to be?",
          options: {
              " 25 minutes": { next: "aromatherapy", duration: "25" },
              " 50 minutes": { next: "aromatherapy", duration: "50" },
              " 80 minutes": { next: "aromatherapy", duration: "80" }
          }
      },
      aromatherapy: {
          question: "Would you like to include aromatherapy?",
          options: {
              "🪔 Yes": { next: "final", aroma: true },
              "✨ No": { next: "final", aroma: false }
          }
      }
  };



  // Add this to section #2, after steps definition
const massageOptions = {
  "classic-partial": {
      title: "Classic Partial Body Massage 🦵🏼",
      description: "Indulge in a personalized partial body massage, focusing on your choice of the back, legs, or face.",
      durations: [
          { time: "25 min", price: 49, discounted: 44 }
      ],
      tags: ["gentle", "focused", "quick"]
  },
  "classic-full": {
      title: "Classic Full Body Rejuvenation 🤲🏼",
      description: "Perfect for massage novices, experience a comprehensive massage targeting your back, arms, and legs with time-honored techniques.",
      durations: [
          { time: "50 min", price: 89, discounted: 80 },
          { time: "80 min", price: 119, discounted: 107 }
      ],
      tags: ["rejuvenating", "full-body", "novices"]
  },
  "pure-relaxation": {
      title: "Pure Relaxation 🌱",
      description: "Combine the soothing benefits of a classic back and legs massage for total relaxation and a sensation of weightlessness.",
      durations: [
          { time: "50 min", price: 89, discounted: 80 }
      ],
      tags: ["relaxing", "soothing", "stress-relief"]
  },
  "deep-tissue": {
      title: "Deep Tissue Massage 💆🏼‍♂️",
      description: "Unwind with a deeply penetrating massage technique designed to release deeply stored tension and restore harmony to muscles, tissues, and joints.",
      durations: [
          { time: "25 min", price: 60, discounted: 54 },
          { time: "50 min", price: 99, discounted: 89 }
      ],
      tags: ["intense", "tension-release", "therapeutic"]
  },
  "aromatic-essence": {
      title: "Aromatic Essence Massage 🪔",
      description: "Drift into tranquility with a delicate massage incorporating your chosen natural essential oil.",
      durations: [
          { time: "25 min", price: 49, discounted: 44 },
          { time: "50 min", price: 89, discounted: 80 },
          { time: "80 min", price: 119, discounted: 107 }
      ],
      tags: ["aromatherapy", "calming", "essential-oils"]
  }
};



  // Initialize user preferences #3
  let userPreferences = {
      focus: null,
      intensity: null,
      duration: null,
      aroma: null
  };

    // Function to transition between sections #4
    function showSection(currentSection, nextSection) {
      currentSection.classList.add("hidden");
      nextSection.classList.remove("hidden");
      nextSection.scrollIntoView({ behavior: "smooth" });
  }

  // Event listener for Start button #5
  startGuideButton?.addEventListener("click", () => {
      console.log("Start button clicked"); // Debug log
      showSection(guideIntro, decisionTree);
      // Initialize the first question
      updateQuestion("start");
  });


    // Enhance our existing handlers to update progress
    function handleOptionClick(nextStep) {
      const currentContainer = document.querySelector('.question-container');
      currentContainer.style.opacity = '0';
      currentContainer.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
          currentContainer.style.opacity = '1';
          currentContainer.style.transform = 'translateY(0)';
          
          // Update progress before moving to next step
          updateProgress(nextStep);
          
          if (nextStep === 'final') {
              showResults(userPreferences);
          } else {
              updateQuestion(nextStep);
          }
      }, 300);
  }

  function updateQuestion(step) {
    const stepData = steps[step];
    if (!stepData) {
        showResults(userPreferences);
        return;
    }

    questionElement.textContent = stepData.question;
    optionsContainer.innerHTML = "";

    Object.entries(stepData.options).forEach(([text, data]) => {
        const button = document.createElement("button");
        button.className = "option";
            
            // Split emoji and text #6
            const [emoji, ...textParts] = text.split(" ");
            button.innerHTML = `
                <span class="option-emoji">${emoji}</span>
                <span class="option-text">${textParts.join(" ")}</span>
            `;
            
            button.addEventListener("click", () => {
                // Update preferences based on the selection #7
                Object.entries(data).forEach(([key, value]) => {
                    if (key !== 'next') {
                        userPreferences[key] = value;
                    }
                });
                
                handleOptionClick(data.next);
            });
            
            optionsContainer.appendChild(button);
        });
    }


    function showResults(preferences) {
      // 🗺️ Define our recommendation logic map
      let recommendedMassage = '';
      
      // Full-body focused paths
      if (preferences.focus === "full") {
          if (preferences.intensity === "deep") {
              recommendedMassage = "Deep Tissue Massage 💆🏼‍♂️";
          } else if (preferences.aroma) {
              recommendedMassage = "Aromatic Essence Massage 🪔";
          } else {
              recommendedMassage = "Classic Full Body Rejuvenation 🤲🏼";
          }
      }
      // Back-focused paths
      else if (preferences.focus === "back") {
          if (preferences.intensity === "deep") {
              recommendedMassage = "Deep Tissue Massage 💆🏼‍♂️";
          } else if (preferences.duration === "50") {
              recommendedMassage = "Pure Relaxation 🌱";
          } else {
              recommendedMassage = "Classic Partial Body Massage 🦵🏼";
          }
      }
      // Legs-focused paths
      else if (preferences.focus === "legs") {
          if (preferences.intensity === "deep") {
              recommendedMassage = "Deep Tissue Massage 💆🏼‍♂️";
          } else if (preferences.duration === "50") {
              recommendedMassage = "Pure Relaxation 🌱";
          } else {
              recommendedMassage = "Classic Partial Body Massage 🦵🏼";
          }
      }
      // Face-focused paths (always leads to either classic or aromatic)
      else if (preferences.focus === "face") {
          if (preferences.aroma) {
              recommendedMassage = "Aromatic Essence Massage 🪔";
          } else {
              recommendedMassage = "Classic Partial Body Massage 🦵🏼";
          }
      }
  
      // 🎨 Create our result display
      recommendationElement.innerHTML = `
          <div class="recommendation-wrapper">
              <h3>${recommendedMassage}</h3>
           
      `;
      
      // Transition to results
      showSection(decisionTree, resultsSection);
  }

    // Log initial state for debugging #8
    console.log("Guide initialized. Elements found:", {
      startButton: !!startGuideButton,
      guideIntro: !!guideIntro,
      decisionTree: !!decisionTree
  });

  
});