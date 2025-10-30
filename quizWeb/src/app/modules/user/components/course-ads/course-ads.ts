import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from '../../../shared/shared-module';

@Component({
  selector: 'app-course-ads',
  imports: [SharedModule],
  templateUrl: './course-ads.html',
  styleUrls: ['./course-ads.css'],
})
export class CourseAds implements OnInit, OnDestroy {
  courses = [
    {
      id: 1,
      title: 'Complete JavaScript Mastery',
      instructor: 'John Smith',
      rating: 4.8,
      students: 12543,
      price: 2999,
      originalPrice: 6999,
      image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop&crop=center',
      category: 'Programming',
      level: 'Beginner to Advanced',
      duration: '40 hours',
      discount: '57% OFF',
      description: 'Master modern JavaScript from basics to advanced concepts including ES6+, async programming, and frameworks.'
    },
    {
      id: 2,
      title: 'Python for Data Science',
      instructor: 'Dr. Sarah Johnson',
      rating: 4.9,
      students: 8765,
      price: 2499,
      originalPrice: 4999,
      image: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=250&fit=crop&crop=center',
      category: 'Data Science',
      level: 'Intermediate',
      duration: '35 hours',
      discount: '50% OFF',
      description: 'Learn Python programming for data analysis, visualization, and machine learning with pandas, numpy, and matplotlib.'
    },
    {
      id: 3,
      title: 'React & Redux Complete Guide',
      instructor: 'Mike Chen',
      rating: 4.7,
      students: 15432,
      price: 3499,
      originalPrice: 7999,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop&crop=center',
      category: 'Web Development',
      level: 'Intermediate',
      duration: '45 hours',
      discount: '56% OFF',
      description: 'Build modern web applications with React, Redux, and hooks. Includes real-world projects and best practices.'
    },
    {
      id: 4,
      title: 'Machine Learning Fundamentals',
      instructor: 'Dr. Emily Davis',
      rating: 4.9,
      students: 23456,
      price: 4999,
      originalPrice: 9999,
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop&crop=center',
      category: 'AI & Machine Learning',
      level: 'Advanced',
      duration: '60 hours',
      discount: '50% OFF',
      description: 'Comprehensive introduction to machine learning algorithms, neural networks, and deep learning with Python.'
    },
    {
      id: 5,
      title: 'Full Stack Web Development',
      instructor: 'Alex Rodriguez',
      rating: 4.6,
      students: 9876,
      price: 5999,
      originalPrice: 12999,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&crop=center',
      category: 'Web Development',
      level: 'Beginner to Advanced',
      duration: '80 hours',
      discount: '54% OFF',
      description: 'Complete web development bootcamp covering HTML, CSS, JavaScript, Node.js, databases, and deployment.'
    },
    {
      id: 6,
      title: 'AWS Cloud Practitioner',
      instructor: 'David Wilson',
      rating: 4.8,
      students: 11234,
      price: 1999,
      originalPrice: 3999,
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop&crop=center',
      category: 'Cloud Computing',
      level: 'Beginner',
      duration: '25 hours',
      discount: '50% OFF',
      description: 'Learn AWS cloud fundamentals, services, and best practices. Prepare for the AWS Cloud Practitioner certification.'
    },
    {
      id: 7,
      title: 'Digital Marketing Mastery',
      instructor: 'Lisa Thompson',
      rating: 4.5,
      students: 7890,
      price: 1499,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&crop=center',
      category: 'Marketing',
      level: 'Beginner',
      duration: '30 hours',
      discount: '50% OFF',
      description: 'Master digital marketing strategies including SEO, social media, content marketing, and analytics.'
    },
    {
      id: 8,
      title: 'Cybersecurity Essentials',
      instructor: 'Robert Kim',
      rating: 4.7,
      students: 5432,
      price: 3999,
      originalPrice: 7999,
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&crop=center',
      category: 'Security',
      level: 'Intermediate',
      duration: '50 hours',
      discount: '50% OFF',
      description: 'Learn cybersecurity fundamentals, ethical hacking, network security, and risk management principles.'
    }
  ];

  private scrollInterval: any;
  currentScrollPosition = 0;
  maxScrollPosition = 0;

  ngOnInit() {
    this.startAutoScroll();
    this.calculateMaxScroll();
  }

  ngOnDestroy() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  private startAutoScroll() {
    this.scrollInterval = setInterval(() => {
      this.scrollNext();
    }, 3000); // Scroll every 3 seconds
  }

  private calculateMaxScroll() {
    // Calculate based on course card width (320px) + gap (20px)
    const cardWidth = 340;
    this.maxScrollPosition = Math.max(0, (this.courses.length - 3) * cardWidth);
  }

  scrollNext() {
    const container = document.querySelector('.courses-scroll-container');
    if (container) {
      this.currentScrollPosition += 340; // Card width + gap
      if (this.currentScrollPosition > this.maxScrollPosition) {
        this.currentScrollPosition = 0; // Reset to beginning
      }
      container.scrollTo({
        left: this.currentScrollPosition,
        behavior: 'smooth'
      });
    }
  }

  scrollPrev() {
    const container = document.querySelector('.courses-scroll-container');
    if (container) {
      this.currentScrollPosition -= 340;
      if (this.currentScrollPosition < 0) {
        this.currentScrollPosition = this.maxScrollPosition;
      }
      container.scrollTo({
        left: this.currentScrollPosition,
        behavior: 'smooth'
      });
    }
  }

  pauseAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  resumeAutoScroll() {
    this.startAutoScroll();
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars);
    }
    return stars;
  }

  hasHalfStar(rating: number, index: number): boolean {
    return Math.floor(rating) === index && rating % 1 !== 0;
  }
}