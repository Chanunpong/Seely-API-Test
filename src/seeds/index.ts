import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { User, Role } from '../users/entities/user.entity';
import { Series, SeriesRating } from '../series/entities/series.entity';
import { SeriesReview } from '../series-reviews/entities/series-review.entity';
import * as bcrypt from 'bcrypt';

async function seed() {
  const dataSource = new DataSource({
    ...dataSourceOptions,
    entities: [User, Series, SeriesReview],
  });

  await dataSource.initialize();

  console.log('🌱 Seeding database...');

  // Create users
  const userRepository = dataSource.getRepository(User);
  const seriesRepository = dataSource.getRepository(Series);
  const reviewRepository = dataSource.getRepository(SeriesReview);

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create recommender user
  let recommender = await userRepository.findOne({ where: { username: 'recommender1' } });
  if (!recommender) {
    recommender = userRepository.create({
      username: 'recommender1',
      password: hashedPassword,
      role: Role.SERIES_RECOMMENDER,
    });
    await userRepository.save(recommender);
    console.log('✅ Created recommender user');
  }

  // Create viewer users
  let viewer1 = await userRepository.findOne({ where: { username: 'viewer1' } });
  if (!viewer1) {
    viewer1 = userRepository.create({
      username: 'viewer1',
      password: hashedPassword,
      role: Role.VIEWER,
    });
    await userRepository.save(viewer1);
    console.log('✅ Created viewer1 user');
  }

  let viewer2 = await userRepository.findOne({ where: { username: 'viewer2' } });
  if (!viewer2) {
    viewer2 = userRepository.create({
      username: 'viewer2',
      password: hashedPassword,
      role: Role.VIEWER,
    });
    await userRepository.save(viewer2);
    console.log('✅ Created viewer2 user');
  }

  // Create sample series
  const sampleSeries = [
    {
      title: 'Breaking Bad',
      year: 2008,
      description: 'ซีรีย์เรื่องนี้เล่าถึงครูเคมีที่กลายเป็นผู้ผลิตยาเสพติด เมื่อเขาได้รับการวินิจฉัยว่าเป็นมะเร็งปอด',
      recommendScore: 9.5,
      rating: SeriesRating.TEEN_18,
      recommender: recommender,
    },
    {
      title: 'Stranger Things',
      year: 2016,
      description: 'เด็กหนุ่มหายตัวไปในเมืองเล็กๆ และค้นพบความลับเหนือธรรมชาติที่น่าสะพรึงกลัว',
      recommendScore: 8.7,
      rating: SeriesRating.TEEN_13,
      recommender: recommender,
    },
    {
      title: 'The Office',
      year: 2005,
      description: 'ซิทคอมเกี่ยวกับชีวิตในออฟฟิศที่เต็มไปด้วยเรื่องราวตลกๆ และความสัมพันธ์ระหว่างเพื่อนร่วมงาน',
      recommendScore: 8.9,
      rating: SeriesRating.GENERAL,
      recommender: recommender,
    },
    {
      title: 'Planet Earth',
      year: 2006,
      description: 'สารคดีธรรมชาติที่แสดงให้เห็นความงามและความหลากหลายของโลกธรรมชาติ',
      recommendScore: 9.4,
      rating: SeriesRating.PROMOTE,
      recommender: recommender,
    },
  ];

  for (const seriesData of sampleSeries) {
    const existingSeries = await seriesRepository.findOne({ 
      where: { title: seriesData.title } 
    });
    
    if (!existingSeries) {
      const series = seriesRepository.create(seriesData);
      await seriesRepository.save(series);
      console.log(`✅ Created series: ${seriesData.title}`);

      // Add sample ratings using upsert pattern
      const review1Data = {
        rating: Math.random() * 2 + 8, // Random rating between 8-10
        comment: 'ซีรีย์ที่ดีมาก แนะนำเลย!',
        series: series,
        reviewer: viewer1,
      };
      
      await reviewRepository
        .upsert(review1Data, { conflictPaths: ['series', 'reviewer'] })
        .catch(() => console.log('Review 1 already exists'));

      const review2Data = {
        rating: Math.random() * 2 + 8, // Random rating between 8-10
        comment: 'เนื้อเรื่องน่าติดตาม ดูแล้วติดใจ',
        series: series,
        reviewer: viewer2,
      };
      
      await reviewRepository
        .upsert(review2Data, { conflictPaths: ['series', 'reviewer'] })
        .catch(() => console.log('Review 2 already exists'));

      // Update avgRating and ratingCount using aggregation
      const { avg, count } = await reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'avg')
        .addSelect('COUNT(review.id)', 'count')
        .where('review.series_id = :seriesId', { seriesId: series.id })
        .getRawOne();

      await seriesRepository.update(series.id, {
        avgRating: parseFloat(avg) || 0,
        ratingCount: parseInt(count, 10) || 0,
      });

      console.log(`✅ Added reviews for: ${seriesData.title}`);
    }
  }

  await dataSource.destroy();
  console.log('🎉 Seeding completed!');
  
  console.log('\n📋 Sample accounts:');
  console.log('Username: recommender1, Password: password123, Role: SERIES_RECOMMENDER');
  console.log('Username: viewer1, Password: password123, Role: VIEWER');
  console.log('Username: viewer2, Password: password123, Role: VIEWER');
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});