'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
  Users, Plus, Search, Filter, Download, Edit, Trash2,
  RotateCw, UserPlus, UserMinus, Calendar, Clock,
  BarChart3, TrendingUp, Target, UserCheck
} from 'lucide-react';

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(false);

  // Mock data - à remplacer par des appels API
  const teams = [
    {
      id: '1',
      name: 'Équipe A – Matin',
      code: 'A',
      members: 14,
      manager: 'Youssef Karim',
      rotation: 'Activée',
      rotationDays: 14,
      isActive: true,
    },
    {
      id: '2',
      name: 'Équipe B – Soir',
      code: 'B',
      members: 9,
      manager: 'Sara El Amrani',
      rotation: 'Désactivée',
      rotationDays: null,
      isActive: false,
    },
    {
      id: '3',
      name: 'Équipe C – Nuit',
      code: 'C',
      members: 7,
      manager: 'Amine L.',
      rotation: 'Activée',
      rotationDays: 7,
      isActive: true,
    },
  ];

  const teamMembers = [
    {
      id: '1',
      name: 'Yasmine Benali',
      matricule: '00421',
      site: 'Site Casablanca',
      shift: 'Matin',
      shiftTime: '08h00 – 16h00',
      photo: null,
    },
    {
      id: '2',
      name: 'Amine Laaroussi',
      matricule: '00317',
      site: 'Site Casablanca',
      shift: 'Nuit',
      shiftTime: '00h00 – 08h00',
      photo: null,
    },
    {
      id: '3',
      name: 'Rachid El Idrissi',
      matricule: '00203',
      site: 'Site Rabat',
      shift: 'Soir',
      shiftTime: '16h00 – 00h00',
      photo: null,
    },
    {
      id: '4',
      name: 'Omar Chami',
      matricule: '00158',
      site: 'Site Tanger',
      shift: 'Matin',
      shiftTime: '07h00 – 15h00',
      photo: null,
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Gestion des équipes
              </h1>
              <p className="text-text-secondary">
                Créer, structurer et suivre les équipes, leurs membres et rotations
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Assigner des employés
              </Button>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle équipe
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section gauche - Liste des équipes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Équipes de travail
                </CardTitle>
                <p className="text-sm text-text-secondary mt-1">
                  Vue globale des équipes par site, rotation et responsable
                </p>
              </CardHeader>
              <CardContent>
                {/* Filtres */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label>Recherche</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <Input
                        placeholder="Nom ou code d'équipe (A, B, C...)"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Rotation</Label>
                    <Select>
                      <option value="">Toutes les équipes</option>
                      <option value="active">Rotation activée</option>
                      <option value="inactive">Rotation désactivée</option>
                    </Select>
                  </div>
                  <div>
                    <Label>Nombre de membres</Label>
                    <Select>
                      <option value="">Tout effectif</option>
                      <option value="small">&lt; 10 membres</option>
                      <option value="medium">10-20 membres</option>
                      <option value="large">&gt; 20 membres</option>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filtres avancés
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exporter CSV
                  </Button>
                </div>

                {/* Tableau des équipes */}
                <div className="border border-border-light rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-background-hover">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nom équipe</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Code</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Membres</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Responsable</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Rotation</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {teams.map((team) => (
                        <tr
                          key={team.id}
                          className="hover:bg-background-hover cursor-pointer transition-colors"
                          onClick={() => setSelectedTeam(team)}
                        >
                          <td className="px-4 py-3 text-sm text-text-primary font-medium">
                            {team.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">
                            {team.code}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">
                            {team.members}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">
                            {team.manager}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={team.isActive ? 'success' : 'secondary'}>
                              {team.rotation}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Edit className="w-4 h-4" />
                                Modifier
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Trash2 className="w-4 h-4 text-danger" />
                                Supprimer
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <RotateCw className="w-4 h-4" />
                                Rotation
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Users className="w-4 h-4" />
                                Membres
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-text-secondary">
                    Affichage de 1-10 sur 24 équipes
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">10 / page</span>
                    <Button variant="outline" size="sm">Préc.</Button>
                    <Button variant="outline" size="sm" className="bg-primary text-white">1</Button>
                    <Button variant="outline" size="sm">Suiv.</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section membres de l'équipe sélectionnée */}
            {selectedTeam && (
              <Card className="mt-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Membres de l'équipe sélectionnée
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <UserPlus className="w-4 h-4" />
                        Assigner des employés
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <UserMinus className="w-4 h-4" />
                        Retirer en masse
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    Gérer les affectations, remplacements et retraits
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {teamMembers.map((member) => (
                      <Card key={member.id} className="border-2 hover:border-primary transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Photo */}
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                              <h4 className="font-semibold text-text-primary">{member.name}</h4>
                              <p className="text-sm text-text-secondary">Matricule {member.matricule} - {member.site}</p>
                              <div className="mt-2">
                                <Badge variant={member.shift === 'Matin' ? 'primary' : member.shift === 'Soir' ? 'warning' : 'secondary'}>
                                  Shift {member.shift} - {member.shiftTime}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              <UserMinus className="w-3 h-3 mr-1" />
                              Retirer de l'équipe
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              Voir planning
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Voir pointages
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              Historique équipe
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Section droite - Formulaire */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Formulaire équipe</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? 'Tableau' : 'Détails'}
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary mb-4">
                  Créer ou modifier une équipe de travail
                </p>

                <div className="space-y-4">
                  {/* Nom de l'équipe */}
                  <div>
                    <Label>Nom de l'équipe</Label>
                    <Input placeholder="Ex : Équipe A – Matin" />
                  </div>

                  {/* Code */}
                  <div>
                    <Label>Code</Label>
                    <Input placeholder="A" maxLength={3} />
                  </div>

                  {/* Responsable */}
                  <div>
                    <Label>Responsable d'équipe</Label>
                    <Select>
                      <option value="">Sélectionner un employé</option>
                      <option value="1">Youssef Karim</option>
                      <option value="2">Sara El Amrani</option>
                      <option value="3">Amine L.</option>
                    </Select>
                  </div>

                  {/* Description */}
                  <div>
                    <Label>Description</Label>
                    <textarea
                      className="w-full px-3 py-2 border border-border-light rounded-input text-sm resize-none"
                      rows={3}
                      placeholder="Ex : Équipe du shift matin pour le site Casablanca – Back-office."
                    />
                  </div>

                  {/* Rotation activée */}
                  <div className="flex items-center justify-between p-4 border border-border-light rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">Rotation activée</p>
                      <p className="text-sm text-text-secondary">
                        Cycle automatique entre équipes A/B/C selon les jours
                      </p>
                    </div>
                    <button
                      onClick={() => setRotationEnabled(!rotationEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        rotationEnabled ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rotationEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Cycle de rotation */}
                  {rotationEnabled && (
                    <div>
                      <Label>Cycle de rotation (jours)</Label>
                      <Input type="number" placeholder="14 jours" defaultValue="14" />
                      <p className="text-xs text-text-secondary mt-1">
                        Options typiques : 7, 14, 21 ou 28 jours.
                      </p>
                    </div>
                  )}

                  {/* Membres de l'équipe */}
                  <div>
                    <Label>Membres de l'équipe</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="gap-1">
                        Yasmine B. - 00421
                        <button className="ml-1 hover:text-danger">×</button>
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        Amine L. - 00317
                        <button className="ml-1 hover:text-danger">×</button>
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        Rachid E. - 00203
                        <button className="ml-1 hover:text-danger">×</button>
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3 gap-2">
                      <UserPlus className="w-4 h-4" />
                      Ajouter des employés...
                    </Button>
                    <p className="text-xs text-text-secondary mt-2">
                      Glisser-déposer pour réordonner les membres (priorité, leaders...).
                    </p>
                  </div>

                  {/* Actions secondaires */}
                  <div className="space-y-2 pt-4 border-t border-border-light">
                    <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                      <Calendar className="w-4 h-4" />
                      Historique complet des modifications d'équipe
                    </Button>
                    <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                      <BarChart3 className="w-4 h-4" />
                      Liée aux plannings & rapports de paie
                    </Button>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-3 pt-4 border-t border-border-light">
                    <Button variant="outline" className="flex-1">
                      Supprimer l'équipe
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Annuler
                    </Button>
                    <Button className="flex-1">
                      Enregistrer l'équipe
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques équipe */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Statistiques équipe</CardTitle>
                  <Button variant="ghost" size="sm">Stats</Button>
                </div>
                <p className="text-sm text-text-secondary mt-1">
                  Photo rapide de l'effectif et des shifts assignés
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Nombre total */}
                  <div className="flex items-center justify-between p-3 bg-background-hover rounded-lg">
                    <div>
                      <p className="text-sm text-text-secondary">Nombre total de membres</p>
                      <p className="text-2xl font-bold text-text-primary mt-1">14</p>
                      <p className="text-xs text-success mt-1">+2 nouveaux cette semaine</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-primary" />
                  </div>

                  {/* Présence du jour */}
                  <div className="flex items-center justify-between p-3 bg-background-hover rounded-lg">
                    <div>
                      <p className="text-sm text-text-secondary">Présence du jour</p>
                      <p className="text-2xl font-bold text-text-primary mt-1">12 / 14</p>
                      <p className="text-xs text-text-secondary mt-1">2 absents ou en congé</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>

                  {/* Répartition des shifts */}
                  <div>
                    <p className="text-sm text-text-secondary mb-2">Répartition des shifts assignés</p>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Matin - 50%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-shift-matin h-2 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Soir - 30%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-shift-soir h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Nuit - 20%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-shift-nuit h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rotation et affectation */}
                  <div className="space-y-3 pt-3 border-t border-border-light">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Rotation mise à jour</span>
                      <Button variant="ghost" size="sm" className="text-xs">Détail</Button>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Admin RH - 14/04/2024 - Cycle passé de 7 à 14 jours
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Affectation en masse</span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Manager - 10/04/2024 - 4 employés ajoutés à l'équipe
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
