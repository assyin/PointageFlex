import { ApiProperty } from '@nestjs/swagger';

export class ImportScheduleRowDto {
  @ApiProperty({ example: 'EMP001', description: 'Matricule de l\'employé' })
  matricule: string;

  @ApiProperty({ example: '2025-01-15', description: 'Date de début (YYYY-MM-DD)' })
  dateDebut: string;

  @ApiProperty({ example: '2025-01-31', required: false, description: 'Date de fin pour créer un intervalle (YYYY-MM-DD). Si vide, crée un planning pour une seule journée.' })
  dateFin?: string;

  @ApiProperty({ example: 'M', description: 'Code du shift (ex: M pour Matin, S pour Soir, N pour Nuit)' })
  shiftCode: string;

  @ApiProperty({ example: '08:00', required: false, description: 'Heure de début personnalisée (HH:mm)' })
  customStartTime?: string;

  @ApiProperty({ example: '16:00', required: false, description: 'Heure de fin personnalisée (HH:mm)' })
  customEndTime?: string;

  @ApiProperty({ example: 'TEAM001', required: false, description: 'Code de l\'équipe' })
  teamCode?: string;

  @ApiProperty({ example: 'Travail à distance', required: false, description: 'Notes' })
  notes?: string;
}

export class ImportScheduleResultDto {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    matricule?: string;
    error: string;
  }>;
  imported: Array<{
    matricule: string;
    date: string;
    shiftCode: string;
  }>;
}

