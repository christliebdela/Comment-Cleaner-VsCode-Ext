// Single line comment
function helloWorld() {
  /* Multi-line
     JavaScript comment */
  console.log("Hello World"); // End of line comment
}

/*
 * Block comment with asterisks
 * that should be removed
 */
const x = 42; // Variable declaration with comment


document.addEventListener('DOMContentLoaded', function() {
    const blogPosts = [
        {
            id: "comment-cleaner-vscode-extension",
            title: "Comment Cleaner Pro: Streamlining Your Code Base",
            excerpt: "Introducing Comment Cleaner Pro, a powerful VSCode extension that helps developers clean and optimize their code by efficiently removing comments while preserving code structure.",
            category: "Tools", 
            image: "comment-cleaner-pro.jpg",
            date: "June 1, 2025",
            readTime: "6 min read",
            featured: true  // Set this post as featured
        },
        {
            id: "ai-model-vulnerabilities",
            title: "AI Model Vulnerabilities: My Findings on Prompt Injection",
            excerpt: "An in-depth look at my recent research into prompt injection vulnerabilities in popular commercial AI systems and how developers can mitigate these risks.",
            category: "research", 
            image: "ai-model-vulnerabilities.jpg",
            date: "March 18, 2025",
            readTime: "10 min read",
            featured: false  // Change this from true to false
        },
        {
            id: "securing-your-api-endpoints",
            title: "Securing Your API Endpoints: Best Practices for 2025",
            excerpt: "With the rise of API-first development, securing your endpoints has never been more critical. In this comprehensive guide, I'll walk through modern security patterns that protect your services without sacrificing developer experience.",
            category: "security", 
            image: "secure-api-endpoints.jpg",
            date: "May 10, 2025",
            readTime: "8 min read",
            featured: false
        },
        {
            id: "ai-developer-augmentation",
            title: "AI Isn't Replacing Developers—It's Supercharging Us",
            excerpt: "While many see AI as a threat to developers, I see it differently—as an opportunity for augmentation and growth. I've embraced this technology as a powerful ally in my development journey.",
            category: "ai", 
            image: "ai-developer-augmentation.jpg",
            date: "May 18, 2025",
            readTime: "6 min read",
            featured: false
        },
        {
            id: "python-performance-tips",
            title: "Python Performance Tips You Probably Didn't Know",
            excerpt: "Python is known for its readability, but not always for its speed. Here are some lesser-known techniques I've been using to optimize performance in critical paths.",
            category: "dev", 
            image: "python-performance-tips.jpg",
            date: "April 28, 2025",
            readTime: "5 min read",
            featured: false
        },
        {
            id: "guardian-v2-coming-soon",
            title: "Guardian v2.0: What's Coming in the Next Release",
            excerpt: "The next major version of Guardian is almost ready for release. Learn about the new threat detection modules and performance improvements coming in v2.0.",
            category: "projects", 
            image: "guardian-v2-update.jpg",
            date: "April 15, 2025",
            readTime: "4 min read",
            featured: false
        },
        {
            id: "advanced-css-grid-techniques",
            title: "Advanced CSS Grid Techniques for Complex Layouts",
            excerpt: "CSS Grid has matured into a powerful layout system. This tutorial explores advanced techniques for creating responsive, complex layouts without media queries.",
            category: "tutorials", 
            image: "css-grid-techniques.jpg",
            date: "March 30, 2025",
            readTime: "7 min read",
            featured: false
        }
    ];

    const categoryDefinitions = {
        "dev": "Development",
        "security": "Security",
        "projects": "Project Updates",
        "tutorials": "Tutorial",
        "research": "Research",
        "ai": "AI & Development"
    };
    
    const postsPerPage = 10;
    let currentPage = 1;
    let currentCategory = 'all';
    
    const featuredPostContainer = document.getElementById('featured-post-container');
    const blogPostsContainer = document.getElementById('blog-posts-container');
    const categoriesList = document.getElementById('categories-list');
    const popularPostsContainer = document.getElementById('popular-posts-container');
    const paginationContainer = document.querySelector('.blog-pagination');
    const searchInput = document.getElementById('blog-search-input');
    const searchForm = document.querySelector('.search-form');
    const newsletterForms = document.querySelectorAll('.newsletter-form, .sidebar-newsletter-form');
    const articleHeaders = document.querySelectorAll('.article-text h2, .article-text h3');
    const shareButtons = document.querySelectorAll('.share-btn');
    const blogContent = document.querySelector('.blog-content');
    const sidebar = document.querySelector('.blog-sidebar');
    
    function populateCategories() {
        const categories = [...new Set(blogPosts.map(post => post.category))].sort();
        
        categories.forEach(category => {
            const displayName = categoryDefinitions[category] || category;
            const li = document.createElement('li');
            li.innerHTML = `<a href="#" data-category="${category}">${displayName}</a>`;
            categoriesList.appendChild(li);
        });
        
        const categoryLinks = document.querySelectorAll('.blog-categories a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                categoryLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-category');
                currentCategory = filter;
                currentPage = 1;
                filterPosts(filter);
                updatePagination();
            });
        });
    }
    
    function filterPosts(category) {
        const allPosts = document.querySelectorAll('.blog-card, .featured-post');
        let visiblePosts = [];
        
        allPosts.forEach(post => {
            const postCategory = post.getAttribute('data-category');
            
            if (category === 'all' || postCategory === category) {
                post.classList.add('visible-post');
                visiblePosts.push(post);
            } else {
                post.classList.remove('visible-post');
                post.style.display = 'none';
            }
        });
        
        applyPagination(visiblePosts);
    }
    
    function displayFeaturedPost() {
        const featuredPost = blogPosts.find(post => post.featured);
        
        if (featuredPost && featuredPostContainer) {
            const categoryName = categoryDefinitions[featuredPost.category] || featuredPost.category;
            
            featuredPostContainer.innerHTML = `
                <div class="featured-post" data-category="${featuredPost.category}">
                    <div class="featured-post-image">
                        <img src="assets/images/blog/${featuredPost.image}" alt="${featuredPost.title}">
                        <span class="post-category">${categoryName}</span>
                    </div>
                    <div class="featured-post-content">
                        <h2><a href="blog/${featuredPost.id}.html">${featuredPost.title}</a></h2>
                        <div class="post-meta">
                            <span class="post-date"><i class="far fa-calendar"></i> ${featuredPost.date}</span>
                            <span class="post-read-time"><i class="far fa-clock"></i> ${featuredPost.readTime}</span>
                        </div>
                        <p class="post-excerpt">${featuredPost.excerpt}</p>
                        <a href="blog/${featuredPost.id}.html" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                    </div>
                </div>
            `;
        }
    }
    
    function displayBlogPosts() {
        if (!blogPostsContainer) return;
        
        const regularPosts = blogPosts.filter(post => !post.featured);
        
        regularPosts.forEach(post => {
            const categoryName = categoryDefinitions[post.category] || post.category;
            
            const postElement = document.createElement('div');
            postElement.className = 'blog-card';
            postElement.setAttribute('data-category', post.category);
            postElement.classList.add('visible-post');
            
            postElement.innerHTML = `
                <div class="blog-card-image">
                    <img src="assets/images/blog/${post.image}" alt="${post.title}">
                </div>
                <div class="blog-card-content">
                    <div class="post-meta">
                        <span class="post-category">${categoryName}</span>
                        <span class="post-date"><i class="far fa-calendar"></i> ${post.date}</span>
                    </div>
                    <h3><a href="blog/${post.id}.html">${post.title}</a></h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <a href="blog/${post.id}.html" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            
            blogPostsContainer.appendChild(postElement);
        });
        
        updatePagination();
    }
    
    function displayPopularPosts() {
        if (!popularPostsContainer) return;
        
        const popularPosts = blogPosts.slice(0, 3);
        
        popularPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'sidebar-post';
            
            postElement.innerHTML = `
                <img src="assets/images/blog/${post.image}" alt="${post.title}">
                <div class="sidebar-post-info">
                    <h4><a href="blog/${post.id}.html">${post.title}</a></h4>
                    <span class="post-date">${post.date}</span>
                </div>
            `;
            
            popularPostsContainer.appendChild(postElement);
        });
    }
    
    function updatePagination() {
        if (!paginationContainer) return;
        
        const visiblePosts = Array.from(document.querySelectorAll('.blog-card, .featured-post')).filter(post => {
            const postCategory = post.getAttribute('data-category');
            return currentCategory === 'all' || postCategory === currentCategory;
        });
        
        const totalPages = Math.ceil(visiblePosts.length / postsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            visiblePosts.forEach(post => {
                post.style.display = '';
                post.classList.add('fade-in');
                setTimeout(() => post.classList.remove('fade-in'), 500);
            });
            return;
        }
        
        let paginationHTML = '';
        
        if (currentPage > 1) {
            paginationHTML += `<a href="#" class="page-nav prev"><i class="fas fa-chevron-left"></i></a>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<a href="#" class="page-link ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
        }
        
        if (currentPage < totalPages) {
            paginationHTML += `<a href="#" class="page-nav next"><i class="fas fa-chevron-right"></i></a>`;
        }
        
        paginationContainer.innerHTML = paginationHTML;
        paginationContainer.style.display = 'flex';
        
        const pageLinks = paginationContainer.querySelectorAll('.page-link, .page-nav');
        pageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (this.classList.contains('page-link')) {
                    currentPage = parseInt(this.getAttribute('data-page'));
                } else if (this.classList.contains('prev')) {
                    currentPage = Math.max(1, currentPage - 1);
                } else if (this.classList.contains('next')) {
                    currentPage = Math.min(totalPages, currentPage + 1);
                }
                
                updatePagination();
                applyPagination(visiblePosts);
                
                const blogContent = document.querySelector('.blog-content');
                if (blogContent) {
                    window.scrollTo({
                        top: blogContent.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        applyPagination(visiblePosts);
    }
    
    function applyPagination(visiblePosts) {
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        
        visiblePosts.forEach((post, index) => {
            if (index >= startIndex && index < endIndex) {
                post.style.display = '';
                post.classList.add('fade-in');
                setTimeout(() => post.classList.remove('fade-in'), 500);
            } else {
                post.style.display = 'none';
            }
        });
    }
    
    function updatePaginationControls(totalVisiblePosts) {
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(totalVisiblePosts / postsPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        
        let paginationHTML = '';
        
        if (currentPage > 1) {
            paginationHTML += `<a href="#" class="page-nav prev"><i class="fas fa-chevron-left"></i></a>`;
        }
        
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<a href="#" class="page-link ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
        }
        
        if (currentPage < totalPages) {
            paginationHTML += `<a href="#" class="page-nav next"><i class="fas fa-chevron-right"></i></a>`;
        }
        
        paginationContainer.innerHTML = paginationHTML;
        paginationContainer.style.display = 'flex';
        
        const pageLinks = paginationContainer.querySelectorAll('.page-link, .page-nav');
        pageLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (this.classList.contains('page-link')) {
                    currentPage = parseInt(this.getAttribute('data-page'));
                } else if (this.classList.contains('prev')) {
                    currentPage = Math.max(1, currentPage - 1);
                } else if (this.classList.contains('next')) {
                    currentPage = Math.min(totalPages, currentPage + 1);
                }
                
                const visiblePosts = Array.from(document.querySelectorAll('.blog-card.visible-post, .featured-post.visible-post'));
                
                applyPagination(visiblePosts);
                updatePaginationControls(visiblePosts.length);
                
                const blogContent = document.querySelector('.blog-content');
                if (blogContent) {
                    window.scrollTo({
                        top: blogContent.offsetTop - 100,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    function performSearch() {
        const searchValue = searchInput.value.toLowerCase().trim();
        console.log("Search triggered with value:", searchValue);
        
        if (searchValue.length < 2) {
            if (searchValue.length === 0) {
                filterPosts(currentCategory);
            }
            return;
        }
        
        const allPostElements = document.querySelectorAll('.blog-card, .featured-post');
        const visiblePosts = [];
        
        allPostElements.forEach(post => {
            post.classList.remove('visible-post');
            post.style.display = 'none';
        });
        
        allPostElements.forEach(post => {
            const title = post.querySelector('h2, h3').textContent.toLowerCase();
            const excerpt = post.querySelector('.post-excerpt').textContent.toLowerCase();
            
            if (title.includes(searchValue) || excerpt.includes(searchValue)) {
                post.classList.add('visible-post');
                post.style.display = '';
                visiblePosts.push(post);
            }
        });
        
        currentPage = 1;
        currentCategory = 'all';
        
        const categoryLinks = document.querySelectorAll('.blog-categories a');
        categoryLinks.forEach(link => link.classList.remove('active'));
        const allCategoriesLink = document.querySelector('.blog-categories a[data-category="all"]');
        if (allCategoriesLink) {
            allCategoriesLink.classList.add('active');
        }
        
        if (visiblePosts.length > 0) {
            applyPagination(visiblePosts);
        }
        
        updatePaginationControls(visiblePosts.length);
    }
    
    function setupNewsletterForms() {
        if (newsletterForms.length) {
            newsletterForms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const email = this.querySelector('input[type="email"]').value;
                    
                    const formParent = this.parentElement;
                    const thankYou = document.createElement('div');
                    thankYou.className = 'form-success';
                    thankYou.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        <p>Thank you for subscribing! You'll receive updates at <strong>${email}</strong></p>
                    `;
                    
                    formParent.replaceChild(thankYou, this);
                    
                    console.log('Newsletter signup:', email);
                });
            });
        }
    }
    
    function setupTableOfContents() {
        if (articleHeaders.length) {
            articleHeaders.forEach(header => {
                const id = header.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                header.id = id;
            });
            
            const tocLinks = document.querySelectorAll('.toc a');
            if (tocLinks.length) {
                window.addEventListener('scroll', function() {
                    let currentActive = '';
                    
                    articleHeaders.forEach(header => {
                        const rect = header.getBoundingClientRect();
                        if (rect.top <= 150) {
                            currentActive = '#' + header.id;
                        }
                    });
                    
                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === currentActive) {
                            link.classList.add('active');
                        }
                    });
                });
            }
        }
    }
    
    function setupSocialSharing() {
        if (shareButtons.length) {
            shareButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const url = encodeURIComponent(window.location.href);
                    const title = encodeURIComponent(document.title);
                    
                    if (this.title === 'Share on Twitter') {
                        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
                    } else if (this.title === 'Share on LinkedIn') {
                        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                    } else if (this.title === 'Share on Facebook') {
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    } else if (this.title === 'Copy link') {
                        navigator.clipboard.writeText(window.location.href)
                            .then(() => {
                                this.innerHTML = '<i class="fas fa-check"></i>';
                                setTimeout(() => {
                                    this.innerHTML = '<i class="fas fa-link"></i>';
                            }, 2000);
                            });
                    }
                });
            });
        }
    }
    
    function setupMobileSidebar() {
        if (blogContent && sidebar) {
            if (!document.querySelector('.sidebar-toggle')) {
                const toggleContainer = document.createElement('div');
                toggleContainer.className = 'toggle-container';
                
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'sidebar-toggle';
                toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Filter & Search';
                
                toggleContainer.appendChild(toggleBtn);
                blogContent.parentNode.insertBefore(toggleContainer, blogContent);
                
                const overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
                
                toggleBtn.addEventListener('click', function() {
                    sidebar.classList.toggle('active');
                    overlay.classList.toggle('active');
                    document.body.classList.toggle('no-scroll');
                });
                
                overlay.addEventListener('click', function() {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                });
                
                const closeBtn = document.createElement('button');
                closeBtn.className = 'sidebar-close';
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                closeBtn.setAttribute('aria-label', 'Close sidebar');
                sidebar.appendChild(closeBtn);
                
                closeBtn.addEventListener('click', function() {
                    sidebar.classList.remove('active');
                    overlay.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                });
            }
        }
    }
    
    function initialize() {
        if (categoriesList) populateCategories();
        if (featuredPostContainer) displayFeaturedPost();
        if (blogPostsContainer) displayBlogPosts();
        if (popularPostsContainer) displayPopularPosts();
        
        if (searchInput) {
            if (searchForm) {
                searchForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    performSearch();
                });
            }
            
            searchInput.addEventListener('input', debounce(performSearch, 300));
            
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch();
                }
            });
            
            const searchFormStyle = document.createElement('style');
            searchFormStyle.textContent = `
                .search-form::after {
                    pointer-events: auto !important;
                    cursor: pointer !important;
                }
            `;
            document.head.appendChild(searchFormStyle);
            
            document.addEventListener('click', function(e) {
                const searchIcon = e.target.closest('.search-form::after');
                if (searchIcon) performSearch();
            });
        }
        
        setupNewsletterForms();
        setupTableOfContents();
        setupSocialSharing();
        setupMobileSidebar();
    }
    
    initialize();
});