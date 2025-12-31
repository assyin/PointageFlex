import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { GenerateYearHolidaysDto } from './dto/generate-year-holidays.dto';
import { generateMoroccoHolidays } from '../data-generator/utils/morocco-holidays';
import * as XLSX from 'xlsx';

@Injectable()
export class HolidaysService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateHolidayDto) {
    // Vérifier qu'il n'existe pas déjà un jour férié avec le même nom et date
    const date = new Date(dto.date);
    const existing = await this.prisma.holiday.findFirst({
      where: {
        tenantId,
        name: dto.name,
        date,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Un jour férié "${dto.name}" existe déjà pour cette date`,
      );
    }

    return this.prisma.holiday.create({
      data: {
        ...dto,
        date,
        tenantId,
        isRecurring: dto.isRecurring || false,
      },
    });
  }

  async findAll(tenantId: string, year?: string) {
    const where: any = { tenantId };

    // Filtrer par année si spécifié
    if (year) {
      const yearNum = parseInt(year);
      where.date = {
        gte: new Date(`${yearNum}-01-01`),
        lte: new Date(`${yearNum}-12-31`),
      };
    }

    const holidays = await this.prisma.holiday.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        tenantId: true,
        name: true,
        date: true,
        isRecurring: true,
      },
      orderBy: { date: 'asc' },
    });

    return {
      data: holidays,
      total: holidays.length,
    };
  }

  async findOne(tenantId: string, id: string) {
    const holiday = await this.prisma.holiday.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!holiday) {
      throw new NotFoundException('Jour férié non trouvé');
    }

    return holiday;
  }

  async update(tenantId: string, id: string, dto: UpdateHolidayDto) {
    // Vérifier que le jour férié appartient au tenant
    const holiday = await this.prisma.holiday.findFirst({
      where: { id, tenantId },
    });

    if (!holiday) {
      throw new NotFoundException('Jour férié non trouvé');
    }

    // Si le nom ou la date change, vérifier qu'il n'y a pas de doublon
    if (dto.name || dto.date) {
      const name = dto.name || holiday.name;
      const date = dto.date ? new Date(dto.date) : holiday.date;

      const existing = await this.prisma.holiday.findFirst({
        where: {
          tenantId,
          name,
          date,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Un jour férié "${name}" existe déjà pour cette date`,
        );
      }
    }

    return this.prisma.holiday.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    // Vérifier que le jour férié appartient au tenant
    const holiday = await this.prisma.holiday.findFirst({
      where: { id, tenantId },
    });

    if (!holiday) {
      throw new NotFoundException('Jour férié non trouvé');
    }

    await this.prisma.holiday.delete({
      where: { id },
    });

    return { message: 'Jour férié supprimé avec succès' };
  }

  async importFromCsv(tenantId: string, fileBuffer: Buffer) {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(worksheet);

      let created = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const row of data) {
        try {
          // Colonnes attendues: Nom, Date, Type, Récurrent
          const name = row['Nom'] || row['Name'];
          const dateStr = row['Date'];
          const typeStr = row['Type'] || 'NATIONAL';
          const isRecurring = row['Récurrent'] === 'Oui' || row['Recurring'] === 'Yes';

          if (!name || !dateStr) {
            errors.push(`Ligne ignorée: Nom ou Date manquant`);
            skipped++;
            continue;
          }

          // Parser la date (format DD/MM/YYYY ou YYYY-MM-DD)
          let date: Date;
          if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
          } else {
            date = new Date(dateStr);
          }

          // Vérifier si existe déjà
          const existing = await this.prisma.holiday.findFirst({
            where: {
              tenantId,
              name,
              date,
            },
          });

          if (existing) {
            skipped++;
            continue;
          }

          // Créer le jour férié
          await this.prisma.holiday.create({
            data: {
              tenantId,
              name,
              date,
              type: typeStr.toUpperCase() as any,
              isRecurring,
            },
          });

          created++;
        } catch (error) {
          errors.push(`Erreur sur la ligne: ${error.message}`);
          skipped++;
        }
      }

      return {
        success: created,
        skipped,
        errors,
        total: data.length,
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'import CSV: ${error.message}`);
    }
  }

  /**
   * Générer automatiquement les jours fériés d'une année complète
   * Basé sur le pays du tenant (actuellement supporte le Maroc)
   */
  async generateYearHolidays(tenantId: string, dto: GenerateYearHolidaysDto) {
    // Récupérer le pays du tenant
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { country: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    const country = tenant.country || 'MA'; // Par défaut Maroc
    const year = dto.year;
    const includeReligious = dto.includeReligious !== false; // Par défaut true
    const mode = dto.mode || 'add'; // Par défaut 'add'

    // Valider l'année
    if (year < 2000 || year > 2100) {
      throw new BadRequestException('L\'année doit être entre 2000 et 2100');
    }

    // Si mode 'replace', supprimer les jours fériés existants de l'année
    if (mode === 'replace') {
      const yearStart = new Date(`${year}-01-01`);
      const yearEnd = new Date(`${year}-12-31`);
      yearEnd.setHours(23, 59, 59, 999);

      await this.prisma.holiday.deleteMany({
        where: {
          tenantId,
          date: {
            gte: yearStart,
            lte: yearEnd,
          },
        },
      });
    }

    // Générer les jours fériés selon le pays
    let holidays: Array<{ name: string; date: Date; isRecurring: boolean; type: any }> = [];

    if (country === 'MA' || country === 'MAR' || country === 'Morocco' || country === 'Maroc') {
      // Générer les jours fériés du Maroc
      const moroccoHolidays = generateMoroccoHolidays(year, year);
      
      // Filtrer les jours religieux si demandé
      if (includeReligious) {
        holidays = moroccoHolidays;
      } else {
        holidays = moroccoHolidays.filter(h => h.type !== 'RELIGIOUS');
      }
    } else {
      // Pour les autres pays, on pourrait ajouter la logique ici
      throw new BadRequestException(
        `La génération automatique des jours fériés n'est pas encore supportée pour le pays "${country}". Veuillez utiliser l'import CSV ou la création manuelle.`
      );
    }

    // Statistiques
    const stats = {
      total: holidays.length,
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Créer les jours fériés en batch (optimisation)
    const holidaysToCreate: Array<{
      tenantId: string;
      name: string;
      date: Date;
      isRecurring: boolean;
      type: any;
    }> = [];

    // Vérifier les doublons et préparer la création
    for (const holiday of holidays) {
      // Normaliser la date à minuit UTC pour la comparaison
      const normalizedDate = new Date(holiday.date);
      normalizedDate.setUTCHours(0, 0, 0, 0);

      // Vérifier si le jour férié existe déjà (même date et même nom)
      const existing = await this.prisma.holiday.findFirst({
        where: {
          tenantId,
          date: normalizedDate,
          name: holiday.name,
        },
      });

      if (existing) {
        stats.skipped++;
        continue;
      }

      holidaysToCreate.push({
        tenantId,
        name: holiday.name,
        date: normalizedDate,
        isRecurring: holiday.isRecurring,
        type: holiday.type,
      });
    }

    // Créer en batch pour optimiser les performances
    if (holidaysToCreate.length > 0) {
      try {
        await this.prisma.holiday.createMany({
          data: holidaysToCreate,
          skipDuplicates: true,
        });
        stats.created = holidaysToCreate.length;
      } catch (error: any) {
        // Si createMany échoue, essayer un par un pour identifier les erreurs
        for (const holiday of holidaysToCreate) {
          try {
            await this.prisma.holiday.create({
              data: holiday,
            });
            stats.created++;
          } catch (err: any) {
            stats.skipped++;
            stats.errors.push(`${holiday.name} (${holiday.date.toISOString().split('T')[0]}): ${err.message}`);
          }
        }
      }
    }

    return {
      success: true,
      year,
      country,
      mode,
      ...stats,
      message: `${stats.created} jour(s) férié(s) créé(s) pour l'année ${year}${stats.skipped > 0 ? `, ${stats.skipped} ignoré(s) (déjà existants)` : ''}`,
    };
  }
}
